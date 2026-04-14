import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'
import jwt from 'jsonwebtoken'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface DecodedToken {
  id: number
  email: string
  collection: string
}

const CHUNKS_DIR = '/tmp/recording-chunks'

function getSessionId(appointmentId: number, doctorId: number): string {
  return `${appointmentId}_${doctorId}`
}

/**
 * POST /api/recording-chunks/finalize
 * Combines all chunks into a single video file and creates the CallRecording entry
 */
export async function POST(request: NextRequest) {
  console.log('[RecordingChunks/Finalize] Starting finalization')
  
  try {
    // Get payload instance first to use its secret
    const payload = await getPayload({ config })
    
    // Check doctor authentication
    const cookieStore = await cookies()
    const doctorToken = cookieStore.get('doctors-token')?.value
    
    if (!doctorToken) {
      console.log('[RecordingChunks/Finalize] No doctor token')
      return NextResponse.json({ error: 'Unauthorized - no token' }, { status: 401 })
    }

    const secret = payload.secret
    if (!secret) {
      console.log('[RecordingChunks/Finalize] No payload secret')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    let decoded: DecodedToken
    try {
      decoded = jwt.verify(doctorToken, secret) as DecodedToken
      console.log('[RecordingChunks/Finalize] Token decoded:', { id: decoded.id, collection: decoded.collection })
    } catch (err) {
      console.log('[RecordingChunks/Finalize] Invalid doctor token:', err)
      return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 })
    }

    if (decoded.collection !== 'doctors') {
      console.log('[RecordingChunks/Finalize] Not a doctor token, collection:', decoded.collection)
      return NextResponse.json({ error: 'Unauthorized - not a doctor' }, { status: 401 })
    }

    const doctorIdFromToken = decoded.id

    const body = await request.json()
    const { appointmentId, doctorId, durationSeconds } = body

    console.log('[RecordingChunks/Finalize] Request data:', { appointmentId, doctorId, durationSeconds })

    if (!appointmentId || !doctorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify doctor owns this recording
    if (doctorIdFromToken !== doctorId) {
      console.log('[RecordingChunks/Finalize] Doctor ID mismatch:', doctorIdFromToken, '!=', doctorId)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sessionId = getSessionId(appointmentId, doctorId)
    const metaPath = path.join(CHUNKS_DIR, `${sessionId}_meta.json`)

    // Read metadata
    let meta: { chunks: number[]; mimeType: string }
    try {
      const metaContent = await fs.readFile(metaPath, 'utf-8')
      meta = JSON.parse(metaContent)
    } catch {
      console.log('[RecordingChunks/Finalize] No chunks found for session:', sessionId)
      return NextResponse.json({ error: 'No chunks found' }, { status: 404 })
    }

    console.log('[RecordingChunks/Finalize] Found chunks:', meta.chunks.length)

    if (meta.chunks.length === 0) {
      return NextResponse.json({ error: 'No chunks to finalize' }, { status: 400 })
    }

    // Read and combine all chunks
    const chunkBuffers: Buffer[] = []
    for (const chunkIndex of meta.chunks) {
      const chunkPath = path.join(CHUNKS_DIR, `${sessionId}_${chunkIndex}.webm`)
      try {
        const buffer = await fs.readFile(chunkPath)
        chunkBuffers.push(buffer)
        console.log('[RecordingChunks/Finalize] Read chunk:', chunkIndex, 'size:', buffer.length)
      } catch (err) {
        console.error('[RecordingChunks/Finalize] Failed to read chunk:', chunkIndex, err)
      }
    }

    if (chunkBuffers.length === 0) {
      return NextResponse.json({ error: 'Failed to read chunks' }, { status: 500 })
    }

    // Combine chunks
    const combinedBuffer = Buffer.concat(chunkBuffers)
    console.log('[RecordingChunks/Finalize] Combined buffer size:', combinedBuffer.length)

    // Convert webm to mp4 using ffmpeg
    const timestamp = Date.now()
    const webmPath = path.join(CHUNKS_DIR, `${sessionId}_combined.webm`)
    const mp4Path = path.join(CHUNKS_DIR, `${sessionId}_converted.mp4`)
    
    // Write combined webm to temp file
    await fs.writeFile(webmPath, combinedBuffer)
    console.log('[RecordingChunks/Finalize] Wrote combined webm:', webmPath)
    
    let finalBuffer: Buffer
    let finalMimeType: string
    let finalFilename: string
    
    try {
      // Convert to mp4 using ffmpeg
      // -y: overwrite output, -i: input, -c:v libx264: H.264 video codec
      // -preset fast: encoding speed, -crf 23: quality (lower = better)
      // -c:a aac: AAC audio codec, -b:a 128k: audio bitrate
      const ffmpegCmd = `ffmpeg -y -i "${webmPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "${mp4Path}"`
      console.log('[RecordingChunks/Finalize] Running ffmpeg:', ffmpegCmd)
      
      await execAsync(ffmpegCmd)
      
      finalBuffer = await fs.readFile(mp4Path)
      finalMimeType = 'video/mp4'
      finalFilename = `consultation-${appointmentId}-${timestamp}.mp4`
      console.log('[RecordingChunks/Finalize] Converted to mp4, size:', finalBuffer.length)
      
      // Cleanup temp files
      await fs.unlink(webmPath).catch(() => {})
      await fs.unlink(mp4Path).catch(() => {})
    } catch (ffmpegError) {
      console.error('[RecordingChunks/Finalize] ffmpeg conversion failed:', ffmpegError)
      console.log('[RecordingChunks/Finalize] Falling back to webm format')
      
      // Fallback to webm if ffmpeg fails
      finalBuffer = combinedBuffer
      finalMimeType = meta.mimeType || 'video/webm'
      finalFilename = `consultation-${appointmentId}-${timestamp}.webm`
      
      // Cleanup temp webm file
      await fs.unlink(webmPath).catch(() => {})
    }

    // Upload directly via Payload API (bypasses nginx body size limit)
    console.log('[RecordingChunks/Finalize] Uploading to media via Payload...')
    
    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt: `Запись консультации #${appointmentId}`,
      },
      file: {
        data: finalBuffer,
        mimetype: finalMimeType,
        name: finalFilename,
        size: finalBuffer.length,
      },
    })
    
    const mediaId = mediaDoc.id
    console.log('[RecordingChunks/Finalize] Media uploaded, ID:', mediaId)

    // Create call-recording entry
    const recording = await payload.create({
      collection: 'call-recordings',
      data: {
        appointment: appointmentId,
        doctor: doctorId,
        video: mediaId,
        durationSeconds: durationSeconds || Math.round(combinedBuffer.length / 50000), // Rough estimate if not provided
        recordedAt: new Date().toISOString(),
      },
    })

    console.log('[RecordingChunks/Finalize] Recording created, ID:', recording.id)

    // Cleanup chunks
    await cleanupSession(sessionId, meta.chunks)

    return NextResponse.json({ 
      success: true, 
      recordingId: recording.id,
      mediaId,
    })

  } catch (error) {
    console.error('[RecordingChunks/Finalize] Error:', error)
    return NextResponse.json(
      { error: 'Failed to finalize recording' },
      { status: 500 }
    )
  }
}

async function cleanupSession(sessionId: string, chunks: number[]) {
  console.log('[RecordingChunks/Finalize] Cleaning up session:', sessionId)
  
  try {
    // Delete chunk files
    for (const chunkIndex of chunks) {
      const chunkPath = path.join(CHUNKS_DIR, `${sessionId}_${chunkIndex}.webm`)
      try {
        await fs.unlink(chunkPath)
      } catch {
        // Ignore
      }
    }
    
    // Delete meta file
    const metaPath = path.join(CHUNKS_DIR, `${sessionId}_meta.json`)
    try {
      await fs.unlink(metaPath)
    } catch {
      // Ignore
    }
    
    console.log('[RecordingChunks/Finalize] Cleanup complete')
  } catch (error) {
    console.error('[RecordingChunks/Finalize] Cleanup error:', error)
  }
}
