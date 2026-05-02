'use client'

import { useEffect, useRef } from 'react'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RemoteVideoProps } from '@/lib/video-call/types'

export function RemoteVideo({ stream, participantName, className }: RemoteVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement && stream) {
      console.log('[v0] RemoteVideo: Setting stream to video element')
      console.log('[v0] RemoteVideo: Stream ID:', stream.id)
      console.log('[v0] RemoteVideo: Audio tracks:', stream.getAudioTracks().length)
      console.log('[v0] RemoteVideo: Video tracks:', stream.getVideoTracks().length)
      
      // Log track details
      stream.getAudioTracks().forEach((track, i) => {
        console.log(`[v0] RemoteVideo: Audio track ${i}: id=${track.id}, enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`)
      })
      stream.getVideoTracks().forEach((track, i) => {
        console.log(`[v0] RemoteVideo: Video track ${i}: id=${track.id}, enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`)
      })
      
      videoElement.srcObject = stream
      // Ensure audio playback
      videoElement.muted = false
      videoElement.volume = 1.0
      videoElement.play().catch(err => {
        console.error('[v0] RemoteVideo: Failed to play:', err)
      })
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null
      }
    }
  }, [stream])

  if (!stream) {
    return (
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center bg-muted',
          className
        )}
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted-foreground/20">
          <User className="h-12 w-12 text-muted-foreground" />
        </div>
        {participantName && (
          <p className="mt-4 text-lg font-medium text-muted-foreground">{participantName}</p>
        )}
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
