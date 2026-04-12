'use client'

import { useEffect, useRef } from 'react'
import { Maximize2, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MinimizedViewProps } from '@/lib/video-call/types'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function MinimizedView({
  localStream,
  remoteStream,
  participantName,
  remainingSeconds,
  onExpand,
  onEndCall,
}: MinimizedViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    // Show remote stream if available, otherwise local
    const streamToShow = remoteStream || localStream
    if (videoElement && streamToShow) {
      videoElement.srcObject = streamToShow
    }
    return () => {
      if (videoElement) {
        videoElement.srcObject = null
      }
    }
  }, [remoteStream, localStream])

  return (
    <div
      className={cn(
        'group fixed bottom-4 right-4 z-50 overflow-hidden rounded-2xl shadow-2xl',
        'h-40 w-56 cursor-pointer bg-black',
        'transition-transform hover:scale-105'
      )}
      onClick={onExpand}
    >
      {/* Video */}
      {remoteStream || localStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!remoteStream}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">{participantName}</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40">
        {/* Top info */}
        <div className="absolute left-2 top-2 flex items-center gap-2">
          <span className="rounded bg-background/80 px-2 py-0.5 text-xs font-mono backdrop-blur-sm">
            {formatTime(remainingSeconds)}
          </span>
        </div>

        {/* Name */}
        <div className="absolute bottom-2 left-2 right-2">
          <p className="truncate text-sm font-medium text-white">{participantName}</p>
        </div>

        {/* Expand button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onExpand()
          }}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        {/* End call button */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onEndCall()
          }}
        >
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
