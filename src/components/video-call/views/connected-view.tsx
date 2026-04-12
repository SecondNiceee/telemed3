'use client'

import { useState } from 'react'
import { LocalVideo } from '../components/local-video'
import { RemoteVideo } from '../components/remote-video'
import { CallControls } from '../components/call-controls'
import { CallTimer } from '../components/call-timer'
import { ConnectionQualityIndicator } from '../components/connection-quality'
import { EndCallDialog } from '../components/end-call-dialog'
import { cn } from '@/lib/utils'
import type { ConnectedViewProps } from '@/lib/video-call/types'

export function ConnectedView({
  localStream,
  remoteStream,
  participant,
  mediaState,
  connectionQuality,
  remainingSeconds,
  isPaused,
  isMinimized,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
  onToggleMinimize,
}: ConnectedViewProps) {
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const handleEndCallClick = () => {
    setShowEndDialog(true)
  }

  const handleConfirmEnd = () => {
    setShowEndDialog(false)
    onEndCall()
  }

  return (
    <div
      className="relative h-full w-full bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={() => setShowControls((prev) => !prev)}
    >
      {/* Remote video (full screen) */}
      <RemoteVideo
        stream={remoteStream}
        participantName={participant.odooPartnerName}
        className="h-full w-full"
      />

      {/* Top overlay - timer and quality */}
      <div
        className={cn(
          'absolute left-0 right-0 top-0 flex items-start justify-between p-4 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        <CallTimer
          remainingSeconds={remainingSeconds}
          isPaused={isPaused}
        />
        <ConnectionQualityIndicator quality={connectionQuality} showLabel />
      </div>

      {/* Local video (PiP) */}
      <div className="absolute bottom-24 right-4">
        <LocalVideo
          stream={localStream}
          isVideoEnabled={mediaState.isVideoEnabled}
          className="shadow-lg"
        />
      </div>

      {/* Bottom overlay - controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 flex flex-col items-center gap-4 bg-gradient-to-t from-black/80 to-transparent p-4 pb-6 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Main controls */}
        <CallControls
          isVideoEnabled={mediaState.isVideoEnabled}
          isAudioEnabled={mediaState.isAudioEnabled}
          isCameraAvailable={mediaState.isCameraAvailable}
          isMicrophoneAvailable={mediaState.isMicrophoneAvailable}
          onToggleVideo={onToggleVideo}
          onToggleAudio={onToggleAudio}
          onEndCall={handleEndCallClick}
          onToggleMinimize={onToggleMinimize}
          isMinimized={isMinimized}
        />
      </div>

      {/* Participant name overlay */}
      <div className="absolute bottom-4 left-4">
        <div className="rounded-full bg-background/80 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-sm font-medium">{participant.odooPartnerName}</span>
        </div>
      </div>

      {/* End call confirmation dialog */}
      <EndCallDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={handleConfirmEnd}
      />
    </div>
  )
}
