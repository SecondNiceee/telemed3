import { serverApiFetch } from './fetch'
import type { PayloadListResponse } from './types'
import type { CallRecording, Media } from '@/payload-types'

export interface ApiCallRecording {
  id: number
  appointment: number | { id: number }
  doctor: number | { id: number; name?: string }
  video: number | Media
  durationSeconds?: number
  recordedAt?: string
  createdAt: string
  updatedAt: string
}

export class CallRecordingsApi {
  /**
   * Fetch recordings for a specific appointment (server-side)
   */
  static async fetchByAppointmentServer(
    appointmentId: number,
    options: { cookie?: string } = {}
  ): Promise<ApiCallRecording[]> {
    const data = await serverApiFetch<PayloadListResponse<ApiCallRecording>>(
      `/api/call-recordings?where[appointment][equals]=${appointmentId}&depth=1&sort=-createdAt`,
      { ...options, cache: 'no-store' }
    )
    return data.docs
  }

  /**
   * Fetch recordings for a specific doctor (server-side)
   */
  static async fetchByDoctorServer(
    doctorId: number,
    options: { cookie?: string } = {}
  ): Promise<ApiCallRecording[]> {
    const data = await serverApiFetch<PayloadListResponse<ApiCallRecording>>(
      `/api/call-recordings?where[doctor][equals]=${doctorId}&depth=1&sort=-createdAt&limit=100`,
      { ...options, cache: 'no-store' }
    )
    return data.docs
  }

  /**
   * Upload a video recording and create a call-recording entry
   * Called from the client when a call ends
   */
  static async uploadRecording(
    appointmentId: number,
    doctorId: number,
    videoBlob: Blob,
    durationSeconds?: number
  ): Promise<ApiCallRecording | null> {
    console.log('[CallRecordingsApi] Starting upload:', {
      appointmentId,
      doctorId,
      blobSize: videoBlob.size,
      blobType: videoBlob.type,
      durationSeconds,
    })
    
    try {
      // First, upload the video to media
      const formData = new FormData()
      const filename = `consultation-${appointmentId}-${Date.now()}.webm`
      formData.append('file', videoBlob, filename)
      formData.append('alt', `Запись консультации #${appointmentId}`)

      console.log('[CallRecordingsApi] Uploading video to /api/media...')
      const mediaResponse = await fetch('/api/media', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const mediaResponseText = await mediaResponse.text()
      console.log('[CallRecordingsApi] Media response status:', mediaResponse.status)
      
      if (!mediaResponse.ok) {
        console.error('[CallRecordingsApi] Failed to upload video:', mediaResponseText)
        return null
      }

      let mediaData
      try {
        mediaData = JSON.parse(mediaResponseText)
      } catch {
        console.error('[CallRecordingsApi] Failed to parse media response:', mediaResponseText)
        return null
      }
      
      const mediaId = mediaData.doc?.id

      if (!mediaId) {
        console.error('[CallRecordingsApi] No media ID returned:', mediaData)
        return null
      }

      console.log('[CallRecordingsApi] Video uploaded, mediaId:', mediaId)

      // Then create the call-recording entry
      console.log('[CallRecordingsApi] Creating call-recording entry...')
      const recordingResponse = await fetch('/api/call-recordings', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment: appointmentId,
          doctor: doctorId,
          video: mediaId,
          durationSeconds,
          recordedAt: new Date().toISOString(),
        }),
      })

      const recordingResponseText = await recordingResponse.text()
      console.log('[CallRecordingsApi] Recording response status:', recordingResponse.status)

      if (!recordingResponse.ok) {
        console.error('[CallRecordingsApi] Failed to create recording:', recordingResponseText)
        return null
      }

      let recordingData
      try {
        recordingData = JSON.parse(recordingResponseText)
      } catch {
        console.error('[CallRecordingsApi] Failed to parse recording response:', recordingResponseText)
        return null
      }
      
      console.log('[CallRecordingsApi] Recording created successfully:', recordingData.doc?.id)
      return recordingData.doc
    } catch (error) {
      console.error('[CallRecordingsApi] Error uploading recording:', error)
      return null
    }
  }

  /**
   * Get video URL from a recording
   */
  static getVideoUrl(recording: ApiCallRecording): string | null {
    if (typeof recording.video === 'object' && recording.video?.url) {
      return recording.video.url
    }
    return null
  }
}
