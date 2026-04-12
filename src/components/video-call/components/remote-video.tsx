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
      videoElement.srcObject = stream
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
