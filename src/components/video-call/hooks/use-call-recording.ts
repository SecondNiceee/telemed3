'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CallRecordingsApi } from '@/lib/api/call-recordings'
import type { UseCallRecordingReturn } from '@/lib/video-call/types'

export function useCallRecording(): UseCallRecordingReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingStartTimeRef = useRef<number | null>(null)

  const startRecording = useCallback((stream: MediaStream) => {
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('[useCallRecording] Already recording')
      return
    }

    try {
      chunksRef.current = []

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
      const recorder = new MediaRecorder(stream, options)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMimeType || 'video/webm' })
        setRecordingBlob(blob)
        setIsRecording(false)
        console.log('[useCallRecording] Recording stopped, blob size:', blob.size)
      }

      recorder.onerror = (event) => {
        console.error('[useCallRecording] Recorder error:', event)
        setIsRecording(false)
      }

      // Record in 1 second chunks
      recorder.start(1000)
      mediaRecorderRef.current = recorder
      recordingStartTimeRef.current = Date.now()
      setIsRecording(true)
      console.log('[useCallRecording] Recording started with mime type:', selectedMimeType)
    } catch (err) {
      console.error('[useCallRecording] Failed to start recording:', err)
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state !== 'recording') {
        console.log('[useCallRecording] Not recording')
        resolve(recordingBlob)
        return
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        setRecordingBlob(blob)
        setIsRecording(false)
        mediaRecorderRef.current = null
        console.log('[useCallRecording] Recording stopped, blob size:', blob.size)
        resolve(blob)
      }

      recorder.stop()
    })
  }, [recordingBlob])

  const uploadRecording = useCallback(async (
    appointmentId: number,
    doctorId: number,
    blobOverride?: Blob
  ): Promise<boolean> => {
    // Use provided blob or fall back to state
    const blob = blobOverride || recordingBlob
    if (!blob) {
      console.log('[useCallRecording] No recording to upload')
      return false
    }

    // Calculate duration
    const durationSeconds = recordingStartTimeRef.current
      ? Math.round((Date.now() - recordingStartTimeRef.current) / 1000)
      : undefined

    setIsUploading(true)
    try {
      console.log('[useCallRecording] Uploading recording, size:', blob.size)
      const result = await CallRecordingsApi.uploadRecording(
        appointmentId,
        doctorId,
        blob,
        durationSeconds
      )

      if (result) {
        console.log('[useCallRecording] Recording uploaded successfully:', result.id)
        toast.success('Запись консультации сохранена')
        return true
      } else {
        console.error('[useCallRecording] Failed to upload recording')
        toast.error('Не удалось сохранить запись')
        return false
      }
    } catch (error) {
      console.error('[useCallRecording] Error uploading recording:', error)
      toast.error('Ошибка при сохранении записи')
      return false
    } finally {
      setIsUploading(false)
    }
  }, [recordingBlob])

  const downloadRecording = useCallback(
    (filename: string = 'consultation-recording') => {
      if (!recordingBlob) {
        console.log('[useCallRecording] No recording to download')
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
