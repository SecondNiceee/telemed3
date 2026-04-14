'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { UseCallRecordingReturn } from '@/lib/video-call/types'
import { getBasePath } from '@/lib/utils/basePath'

// Интервал отправки chunks (30 секунд)
const CHUNK_INTERVAL_MS = 30000

// Размеры canvas для записи
const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 720
const PIP_WIDTH = 240 // Размер окошка пациента
const PIP_HEIGHT = 180
const PIP_MARGIN = 20 // Отступ от края

interface ChunkUploadState {
  appointmentId: number
  doctorId: number
  chunkIndex: number
  mimeType: string
}

interface CompositeRecordingState {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  localVideo: HTMLVideoElement
  remoteVideo: HTMLVideoElement
  animationFrameId: number
}

export function useCallRecording(): UseCallRecordingReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingStartTimeRef = useRef<number | null>(null)
  const chunkUploadStateRef = useRef<ChunkUploadState | null>(null)
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pendingChunksRef = useRef<Blob[]>([])
  const compositeStateRef = useRef<CompositeRecordingState | null>(null)

  // Upload a chunk to the server
  const uploadChunk = useCallback(async (
    chunk: Blob,
    chunkIndex: number,
    isLast: boolean = false
  ): Promise<boolean> => {
    const state = chunkUploadStateRef.current
    if (!state) {
      console.log('[Recording] No upload state, skipping chunk upload')
      return false
    }

    console.log('[Recording] Uploading chunk:', {
      chunkIndex,
      size: chunk.size,
      isLast,
      appointmentId: state.appointmentId,
      doctorId: state.doctorId,
    })

    try {
      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('appointmentId', state.appointmentId.toString())
      formData.append('doctorId', state.doctorId.toString())
      formData.append('chunkIndex', chunkIndex.toString())
      formData.append('isLast', isLast.toString())
      formData.append('mimeType', state.mimeType)

      const basePath = getBasePath()
      const response = await fetch(`${basePath}/api/recording-chunks`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Recording] Chunk upload failed:', response.status, errorText)
        return false
      }

      const data = await response.json()
      console.log('[Recording] Chunk uploaded successfully:', data)
      return true
    } catch (error) {
      console.error('[Recording] Chunk upload error:', error)
      return false
    }
  }, [])

  // Process and upload pending chunks
  const processPendingChunks = useCallback(async () => {
    const state = chunkUploadStateRef.current
    if (!state || pendingChunksRef.current.length === 0) {
      return
    }

    // Get all pending chunks and clear the array
    const chunksToUpload = [...pendingChunksRef.current]
    pendingChunksRef.current = []

    // Combine chunks into one blob for this interval
    const combinedChunk = new Blob(chunksToUpload, { type: state.mimeType })
    
    console.log('[Recording] Processing pending chunks:', {
      numChunks: chunksToUpload.length,
      combinedSize: combinedChunk.size,
      chunkIndex: state.chunkIndex,
    })

    const success = await uploadChunk(combinedChunk, state.chunkIndex, false)
    
    if (success) {
      chunkUploadStateRef.current = {
        ...state,
        chunkIndex: state.chunkIndex + 1,
      }
    } else {
      // Put chunks back for retry
      pendingChunksRef.current = [...chunksToUpload, ...pendingChunksRef.current]
      console.log('[Recording] Chunks queued for retry, total:', pendingChunksRef.current.length)
    }
  }, [uploadChunk])

  // Start periodic chunk upload
  const startChunkUpload = useCallback((appointmentId: number, doctorId: number, mimeType: string) => {
    console.log('[Recording] Starting chunk upload for:', { appointmentId, doctorId })
    
    chunkUploadStateRef.current = {
      appointmentId,
      doctorId,
      chunkIndex: 0,
      mimeType,
    }

    // Upload chunks every 30 seconds
    uploadIntervalRef.current = setInterval(() => {
      processPendingChunks()
    }, CHUNK_INTERVAL_MS)
  }, [processPendingChunks])

  // Stop periodic chunk upload
  const stopChunkUpload = useCallback(() => {
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current)
      uploadIntervalRef.current = null
    }
  }, [])

  // Create composite stream with Picture-in-Picture effect
  // Local (doctor) video = main, Remote (patient) video = small PiP in corner
  const createCompositeStream = useCallback((
    localStream: MediaStream,
    remoteStream: MediaStream
  ): MediaStream => {
    // Create canvas for video compositing
    const canvas = document.createElement('canvas')
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    const ctx = canvas.getContext('2d')!
    
    // Create hidden video elements for streams
    const localVideo = document.createElement('video')
    localVideo.srcObject = localStream
    localVideo.muted = true
    localVideo.playsInline = true
    localVideo.autoplay = true
    
    const remoteVideo = document.createElement('video')
    remoteVideo.srcObject = remoteStream
    remoteVideo.muted = true
    remoteVideo.playsInline = true
    remoteVideo.autoplay = true

    // Start playback
    localVideo.play().catch(console.error)
    remoteVideo.play().catch(console.error)
    
    // Animation loop for compositing
    const drawFrame = () => {
      // Draw local (doctor) video as main background
      if (localVideo.readyState >= 2) {
        ctx.drawImage(localVideo, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      } else {
        // Fill with dark background if video not ready
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      }
      
      // Draw remote (patient) video as PiP in bottom-right corner
      if (remoteVideo.readyState >= 2) {
        const pipX = CANVAS_WIDTH - PIP_WIDTH - PIP_MARGIN
        const pipY = CANVAS_HEIGHT - PIP_HEIGHT - PIP_MARGIN
        
        // Draw border/shadow for PiP
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(pipX - 2, pipY - 2, PIP_WIDTH + 4, PIP_HEIGHT + 4)
        
        // Draw PiP video
        ctx.drawImage(remoteVideo, pipX, pipY, PIP_WIDTH, PIP_HEIGHT)
        
        // Draw thin border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.strokeRect(pipX, pipY, PIP_WIDTH, PIP_HEIGHT)
      }
      
      compositeStateRef.current!.animationFrameId = requestAnimationFrame(drawFrame)
    }
    
    const animationFrameId = requestAnimationFrame(drawFrame)
    
    // Store state for cleanup
    compositeStateRef.current = {
      canvas,
      ctx,
      localVideo,
      remoteVideo,
      animationFrameId,
    }
    
    // Create stream from canvas
    const canvasStream = canvas.captureStream(30) // 30 FPS
    
    // Combine canvas video with BOTH audio tracks
    const combinedStream = new MediaStream()
    
    // Add canvas video track
    canvasStream.getVideoTracks().forEach(track => {
      combinedStream.addTrack(track)
    })
    
    // Add audio tracks from both streams (both doctor and patient audio)
    localStream.getAudioTracks().forEach(track => {
      combinedStream.addTrack(track)
    })
    remoteStream.getAudioTracks().forEach(track => {
      combinedStream.addTrack(track)
    })
    
    console.log('[Recording] Composite stream created:', {
      videoTracks: combinedStream.getVideoTracks().length,
      audioTracks: combinedStream.getAudioTracks().length,
      canvasSize: `${CANVAS_WIDTH}x${CANVAS_HEIGHT}`,
      pipSize: `${PIP_WIDTH}x${PIP_HEIGHT}`,
    })
    
    return combinedStream
  }, [])

  // Cleanup composite recording resources
  const cleanupCompositeState = useCallback(() => {
    if (compositeStateRef.current) {
      cancelAnimationFrame(compositeStateRef.current.animationFrameId)
      compositeStateRef.current.localVideo.srcObject = null
      compositeStateRef.current.remoteVideo.srcObject = null
      compositeStateRef.current = null
      console.log('[Recording] Composite state cleaned up')
    }
  }, [])

  // Finalize recording on server
  const finalizeRecording = useCallback(async (): Promise<boolean> => {
    const state = chunkUploadStateRef.current
    if (!state) {
      console.log('[Recording] No state for finalization')
      return false
    }

    console.log('[Recording] Finalizing recording:', {
      appointmentId: state.appointmentId,
      doctorId: state.doctorId,
      totalChunks: state.chunkIndex,
    })

    // First, upload any remaining pending chunks
    if (pendingChunksRef.current.length > 0) {
      const remainingChunks = [...pendingChunksRef.current]
      pendingChunksRef.current = []
      
      const combinedChunk = new Blob(remainingChunks, { type: state.mimeType })
      console.log('[Recording] Uploading final pending chunks:', {
        numChunks: remainingChunks.length,
        size: combinedChunk.size,
      })
      
      await uploadChunk(combinedChunk, state.chunkIndex, true)
    }

    // Calculate duration
    const durationSeconds = recordingStartTimeRef.current
      ? Math.round((Date.now() - recordingStartTimeRef.current) / 1000)
      : undefined

    try {
      const basePath = getBasePath()
      const response = await fetch(`${basePath}/api/recording-chunks/finalize`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: state.appointmentId,
          doctorId: state.doctorId,
          durationSeconds,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Recording] Finalization failed:', response.status, errorText)
        return false
      }

      const data = await response.json()
      console.log('[Recording] Recording finalized:', data)
      
      chunkUploadStateRef.current = null
      return true
    } catch (error) {
      console.error('[Recording] Finalization error:', error)
      return false
    }
  }, [uploadChunk])

  // Start recording with Picture-in-Picture composite
  // localStream = doctor's camera, remoteStream = patient's camera
  const startRecording = useCallback((
    localStream: MediaStream,
    appointmentId?: number,
    doctorId?: number,
    remoteStream?: MediaStream
  ) => {
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('[Recording] Already recording')
      return
    }

    try {
      chunksRef.current = []
      pendingChunksRef.current = []

      // Create composite stream with PiP if we have both streams
      let recordingStream: MediaStream
      if (remoteStream) {
        console.log('[Recording] Creating PiP composite stream (doctor + patient)')
        recordingStream = createCompositeStream(localStream, remoteStream)
      } else {
        console.log('[Recording] Recording single stream only')
        recordingStream = localStream
      }

      // Try to use VP9 for better quality, fall back to VP8 or default
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ]

      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }

      const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined
      const recorder = new MediaRecorder(recordingStream, options)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          pendingChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMimeType || 'video/webm' })
        setRecordingBlob(blob)
        setIsRecording(false)
        cleanupCompositeState() // Clean up canvas and videos
        console.log('[Recording] Stopped, total blob size:', blob.size)
      }

      recorder.onerror = (event) => {
        console.error('[Recording] Recorder error:', event)
        setIsRecording(false)
      }

      // Record in 1 second chunks for smooth streaming
      recorder.start(1000)
      mediaRecorderRef.current = recorder
      recordingStartTimeRef.current = Date.now()
      setIsRecording(true)
      
      console.log('[Recording] Started with mime type:', selectedMimeType)

      // Start chunk upload if appointmentId and doctorId provided
      if (appointmentId && doctorId) {
        startChunkUpload(appointmentId, doctorId, selectedMimeType || 'video/webm')
      }
    } catch (err) {
      console.error('[Recording] Failed to start:', err)
    }
  }, [startChunkUpload])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    stopChunkUpload()
    
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state !== 'recording') {
        console.log('[Recording] Not recording')
        resolve(recordingBlob)
        return
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        setRecordingBlob(blob)
        setIsRecording(false)
        mediaRecorderRef.current = null
        console.log('[Recording] Stopped, blob size:', blob.size)
        resolve(blob)
      }

      recorder.stop()
    })
  }, [recordingBlob, stopChunkUpload])

  const uploadRecording = useCallback(async (
    appointmentId: number,
    doctorId: number,
    blobOverride?: Blob
  ): Promise<boolean> => {
    setIsUploading(true)
    
    try {
      // If we were using chunk upload, finalize on server
      if (chunkUploadStateRef.current) {
        console.log('[Recording] Finalizing server-side recording')
        const success = await finalizeRecording()
        if (success) {
          toast.success('Запись консультации сохранена')
          return true
        }
        // Fall through to client-side upload if server finalization failed
        console.log('[Recording] Server finalization failed, trying client upload')
      }

      // Client-side upload fallback
      const blob = blobOverride || recordingBlob
      if (!blob) {
        console.log('[Recording] No blob to upload')
        return false
      }

      const durationSeconds = recordingStartTimeRef.current
        ? Math.round((Date.now() - recordingStartTimeRef.current) / 1000)
        : undefined

      console.log('[Recording] Client-side upload, size:', blob.size)

      // Upload video to media
      const basePath = getBasePath()
      const formData = new FormData()
      const filename = `consultation-${appointmentId}-${Date.now()}.webm`
      formData.append('file', blob, filename)
      formData.append('alt', `Запись консультации #${appointmentId}`)

      const mediaResponse = await fetch(`${basePath}/api/media`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!mediaResponse.ok) {
        console.error('[Recording] Media upload failed:', await mediaResponse.text())
        toast.error('Не удалось сохранить запись')
        return false
      }

      const mediaData = await mediaResponse.json()
      const mediaId = mediaData.doc?.id

      if (!mediaId) {
        console.error('[Recording] No media ID returned')
        toast.error('Не удалось сохранить запись')
        return false
      }

      // Create call-recording entry
      const recordingResponse = await fetch(`${basePath}/api/call-recordings`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment: appointmentId,
          doctor: doctorId,
          video: mediaId,
          durationSeconds,
          recordedAt: new Date().toISOString(),
        }),
      })

      if (!recordingResponse.ok) {
        console.error('[Recording] Recording creation failed:', await recordingResponse.text())
        toast.error('Не удалось сохранить запись')
        return false
      }

      console.log('[Recording] Upload complete')
      toast.success('Запись консультации сохранена')
      return true
    } catch (error) {
      console.error('[Recording] Upload error:', error)
      toast.error('Ошибка при сохранении записи')
      return false
    } finally {
      setIsUploading(false)
    }
  }, [recordingBlob, finalizeRecording])

  const downloadRecording = useCallback(
    (filename: string = 'consultation-recording') => {
      if (!recordingBlob) {
        console.log('[Recording] No blob to download')
        return
      }

      const url = URL.createObjectURL(recordingBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}-${Date.now()}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [recordingBlob]
  )

  return {
    isRecording,
    recordingBlob,
    isUploading,
    startRecording,
    stopRecording,
    uploadRecording,
    downloadRecording,
  }
}
