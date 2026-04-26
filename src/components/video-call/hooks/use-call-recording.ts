'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { UseCallRecordingReturn } from '@/lib/video-call/types'
import { getBasePath } from '@/lib/utils/basePath'
import { useCallStore } from '@/stores/call-store'

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
  isAudioOnly: boolean
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
  // Flag to prevent chunk uploads after recording is stopped
  const isStoppedRef = useRef<boolean>(false)

  // Upload a chunk to the server
  const uploadChunk = useCallback(async (
    chunk: Blob,
    chunkIndex: number,
    isLast: boolean = false
  ): Promise<boolean> => {
    // Check call store status directly (works even when tab is inactive)
    const callStatus = useCallStore.getState().status
    const callEnded = callStatus === 'ended' || callStatus === 'idle'
    
    // Don't upload if recording was stopped OR if call has ended (unless this is the last chunk during finalization)
    if ((isStoppedRef.current || callEnded) && !isLast) {
      console.log('[Recording] Skipping chunk upload - isStoppedRef:', isStoppedRef.current, ', callStatus:', callStatus, ', isLast:', isLast)
      return false
    }
    
    const state = chunkUploadStateRef.current
    if (!state) {
      console.log('[Recording] No upload state (chunkUploadStateRef=null), skipping chunk upload')
      return false
    }

    console.log('[Recording] Uploading chunk:', {
      chunkIndex,
      size: chunk.size,
      isLast,
      appointmentId: state.appointmentId,
      doctorId: state.doctorId,
      isStoppedRef: isStoppedRef.current,
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
    // Check call store status directly (works even when tab is inactive)
    const callStoreState = useCallStore.getState()
    const callStatus = callStoreState.status
    const storeAppointmentId = callStoreState.appointmentId
    const callEnded = callStatus === 'ended' || callStatus === 'idle'
    
    console.log('[Recording] processPendingChunks check:', { 
      callStatus, 
      storeAppointmentId,
      callEnded, 
      isStoppedRef: isStoppedRef.current,
      hasPendingChunks: pendingChunksRef.current.length > 0
    })
    
    // Don't process if recording was stopped OR if call has ended
    if (isStoppedRef.current || callEnded) {
      if (!isStoppedRef.current && callEnded) {
        // Call ended but isStoppedRef wasn't set - this means callback didn't fire (inactive tab)
        // Set it now to prevent further uploads
        console.log('[Recording] Call ended (store status:', callStatus, '), stopping chunk uploads')
        isStoppedRef.current = true
        // Clear interval directly (stopChunkUpload not available here)
        if (uploadIntervalRef.current) {
          clearInterval(uploadIntervalRef.current)
          uploadIntervalRef.current = null
        }
        pendingChunksRef.current = []
      }
      return
    }
    
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
      isStoppedRef: isStoppedRef.current,
    })

    // Double-check AGAIN before upload (in case stopRecording was called while we prepared chunks)
    if (isStoppedRef.current) {
      console.log('[Recording] Recording stopped before upload, aborting chunk processing')
      return
    }

    const success = await uploadChunk(combinedChunk, state.chunkIndex, false)
    
    if (success && !isStoppedRef.current) {
      // Only update state if we're still recording
      chunkUploadStateRef.current = {
        ...state,
        chunkIndex: state.chunkIndex + 1,
      }
    } else if (!success && !isStoppedRef.current) {
      // Put chunks back for retry only if still recording
      pendingChunksRef.current = [...chunksToUpload, ...pendingChunksRef.current]
      console.log('[Recording] Chunks queued for retry, total:', pendingChunksRef.current.length)
    }
  }, [uploadChunk])

  // Start periodic chunk upload
  const startChunkUpload = useCallback((appointmentId: number, doctorId: number, mimeType: string, isAudioOnly: boolean = false) => {
    console.log('[Recording] Starting chunk upload for:', { appointmentId, doctorId, isAudioOnly })
    
    chunkUploadStateRef.current = {
      appointmentId,
      doctorId,
      chunkIndex: 0,
      mimeType,
      isAudioOnly,
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
    
    // Create stream from canvas at 30 FPS
    const canvasStream = canvas.captureStream(30)
    
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
  const finalizeRecording = useCallback(async (isAudioOnlyOverride?: boolean): Promise<boolean> => {
    const state = chunkUploadStateRef.current
    if (!state) {
      console.log('[Recording] No state for finalization')
      return false
    }

    const isAudioOnly = isAudioOnlyOverride ?? state.isAudioOnly
    console.log('[Recording] Finalizing recording:', {
      appointmentId: state.appointmentId,
      doctorId: state.doctorId,
      totalChunks: state.chunkIndex,
      isAudioOnly,
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
          recordingType: isAudioOnly ? 'audio' : 'video',
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Recording] Finalization failed:', response.status, errorText)
        return false
      }

  const data = await response.json()
  console.log('[Recording] Recording finalized:', data)
  
  // Clear all state to prevent any further uploads
  chunkUploadStateRef.current = null
  pendingChunksRef.current = []
  chunksRef.current = []
  return true
    } catch (error) {
      console.error('[Recording] Finalization error:', error)
      return false
    }
  }, [uploadChunk])

  // Start recording with Picture-in-Picture composite
  // localStream = doctor's camera/mic, remoteStream = patient's camera/mic
  // isAudioOnly = true for audio-only calls (no video)
  const startRecording = useCallback((
    localStream: MediaStream,
    appointmentId?: number,
    doctorId?: number,
    remoteStream?: MediaStream,
    isAudioOnly: boolean = false
  ) => {
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('[Recording] Already recording')
      return
    }

    try {
      chunksRef.current = []
      pendingChunksRef.current = []
      isStoppedRef.current = false // Reset stopped flag for new recording

      let recordingStream: MediaStream

      if (isAudioOnly) {
        // Audio-only recording: combine audio tracks from both streams
        console.log('[Recording] Creating audio-only stream')
        recordingStream = new MediaStream()
        localStream.getAudioTracks().forEach(track => {
          recordingStream.addTrack(track)
        })
        if (remoteStream) {
          remoteStream.getAudioTracks().forEach(track => {
            recordingStream.addTrack(track)
          })
        }
      } else if (remoteStream) {
        // Video call: create composite stream with PiP
        console.log('[Recording] Creating PiP composite stream (doctor + patient)')
        recordingStream = createCompositeStream(localStream, remoteStream)
      } else {
        // Single stream video
        console.log('[Recording] Recording single stream only')
        recordingStream = localStream
      }

      // Select appropriate mime type based on call type
      let selectedMimeType = ''
      if (isAudioOnly) {
        // Audio-only mime types
        const audioMimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
        ]
        for (const mimeType of audioMimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType
            break
          }
        }
      } else {
        // Video mime types
        const videoMimeTypes = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
        ]
        for (const mimeType of videoMimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType
            break
          }
        }
      }

      const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined
      const recorder = new MediaRecorder(recordingStream, options)

      const defaultMimeType = isAudioOnly ? 'audio/webm' : 'video/webm'
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          pendingChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMimeType || defaultMimeType })
        setRecordingBlob(blob)
        setIsRecording(false)
        if (!isAudioOnly) {
          cleanupCompositeState() // Clean up canvas and videos (only for video)
        }
        console.log('[Recording] Stopped, total blob size:', blob.size, 'isAudioOnly:', isAudioOnly)
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
      
      console.log('[Recording] Started with mime type:', selectedMimeType, 'isAudioOnly:', isAudioOnly)

      // Start chunk upload if appointmentId and doctorId provided
      if (appointmentId && doctorId) {
        startChunkUpload(appointmentId, doctorId, selectedMimeType || defaultMimeType, isAudioOnly)
      }
    } catch (err) {
      console.error('[Recording] Failed to start:', err)
    }
  }, [startChunkUpload, createCompositeStream, cleanupCompositeState])

const stopRecording = useCallback(async (): Promise<Blob | null> => {
  // Check if already stopped - prevent multiple calls
  if (isStoppedRef.current) {
    console.log('[Recording] Already stopped (isStoppedRef=true), returning existing blob')
    return recordingBlob
  }
  
  // Mark recording as stopped immediately to prevent further chunk uploads
  isStoppedRef.current = true
  console.log('[Recording] Stopping recording, isStoppedRef set to true')
  
  // Stop interval FIRST
  stopChunkUpload()
  
  // Clear pending chunks immediately to prevent any in-flight uploads
  pendingChunksRef.current = []
  console.log('[Recording] Cleared pending chunks')
  
  // Also clear the upload state to prevent any new uploads
  const savedState = chunkUploadStateRef.current // Save for finalization
  console.log('[Recording] Saved chunkUploadState for finalization:', savedState ? 'yes' : 'no')
  
  return new Promise((resolve) => {
  const recorder = mediaRecorderRef.current
  if (!recorder || recorder.state !== 'recording') {
  console.log('[Recording] Not recording or already stopped')
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
    blobOverride?: Blob,
    isAudioOnly: boolean = false
  ): Promise<boolean> => {
    setIsUploading(true)
    
    try {
      // If we were using chunk upload, finalize on server
      if (chunkUploadStateRef.current) {
        console.log('[Recording] Finalizing server-side recording, isAudioOnly:', isAudioOnly)
        const success = await finalizeRecording(isAudioOnly)
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

      console.log('[Recording] Client-side upload, size:', blob.size, 'isAudioOnly:', isAudioOnly)

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
          recordingType: isAudioOnly ? 'audio' : 'video',
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
