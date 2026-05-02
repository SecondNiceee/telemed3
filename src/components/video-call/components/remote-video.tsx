'use client'

import { useEffect, useRef } from 'react'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RemoteVideoProps } from '@/lib/video-call/types'

export function RemoteVideo({ stream, participantName, className }: RemoteVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !stream) return
    
    let isCancelled = false
    
    videoElement.srcObject = stream
    // Ensure audio playback
    videoElement.muted = false
    videoElement.volume = 1.0
    
    // Use a small delay to avoid AbortError when stream updates rapidly
    const playVideo = async () => {
      // Wait a tick to allow previous play requests to settle
      await new Promise(resolve => setTimeout(resolve, 50))
      
      if (isCancelled) return
      
      try {
        await videoElement.play()
      } catch (err) {
        // AbortError is expected when stream updates quickly - ignore it
        // Other errors are also not critical as autoPlay should handle playback
        if (err instanceof Error && err.name !== 'AbortError') {
          console.warn('[RemoteVideo] Play warning:', err.message)
        }
      }
    }
    
    playVideo()

    return () => {
      isCancelled = true
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
