'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Maximize2, PhoneOff, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MinimizedViewProps } from '@/lib/video-call/types'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

interface Position {
  x: number
  y: number
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<Position>({ x: 16, y: 16 }) // bottom-right with 16px padding
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start drag if clicking on the drag handle area
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      setDragStart({
        x: e.clientX + position.x,
        y: e.clientY + position.y,
      })
    }
  }, [position])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const containerHeight = containerRef.current.offsetHeight
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    // Calculate new position (from bottom-right)
    let newX = dragStart.x - e.clientX
    let newY = dragStart.y - e.clientY

    // Constrain to viewport
    newX = Math.max(16, Math.min(newX, windowWidth - containerWidth - 16))
    newY = Math.max(16, Math.min(newY, windowHeight - containerHeight - 16))

    setPosition({ x: newX, y: newY })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      e.stopPropagation()
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({
        x: touch.clientX + position.x,
        y: touch.clientY + position.y,
      })
    }
  }, [position])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return

    const touch = e.touches[0]
    const containerWidth = containerRef.current.offsetWidth
    const containerHeight = containerRef.current.offsetHeight
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let newX = dragStart.x - touch.clientX
    let newY = dragStart.y - touch.clientY

    newX = Math.max(16, Math.min(newX, windowWidth - containerWidth - 16))
    newY = Math.max(16, Math.min(newY, windowHeight - containerHeight - 16))

    setPosition({ x: newX, y: newY })
  }, [isDragging, dragStart])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      return () => {
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, handleTouchMove, handleTouchEnd])

  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't expand if we were dragging
    if (isDragging) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    // Don't expand if clicking drag handle
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      return
    }
    onExpand()
  }

  return (
    <div
      ref={containerRef}
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
      }}
      className={cn(
        'group fixed z-50 overflow-hidden rounded-2xl shadow-2xl',
        'h-40 w-56 bg-black',
        isDragging ? 'cursor-grabbing' : 'cursor-pointer',
        !isDragging && 'transition-transform hover:scale-[1.02]'
      )}
      onClick={handleContainerClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
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
        {/* Drag handle */}
        <div
          data-drag-handle
          className={cn(
            "absolute left-1/2 top-1 -translate-x-1/2 flex items-center justify-center",
            "px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isDragging ? "opacity-100 cursor-grabbing" : "cursor-grab"
          )}
        >
          <GripVertical className="h-4 w-4 text-white/80" />
        </div>

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
