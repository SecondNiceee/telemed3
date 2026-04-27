'use client'

/**
 * VideoCallProviderWrapper
 * 
 * Обертка для выбора между PeerJS и MediaSoup провайдерами.
 * Используйте env переменную NEXT_PUBLIC_USE_MEDIASOUP=true для включения MediaSoup.
 */

import type { ReactNode } from 'react'
import { VideoCallProvider } from './video-call-provider'
import { VideoCallProviderMediaSoup } from './video-call-provider-mediasoup'

interface VideoCallProviderWrapperProps {
  children: ReactNode
}

// Feature flag для включения MediaSoup
const USE_MEDIASOUP = process.env.NEXT_PUBLIC_USE_MEDIASOUP === 'true'

export function VideoCallProviderWrapper({ children }: VideoCallProviderWrapperProps) {
  if (USE_MEDIASOUP) {
    return (
      <VideoCallProviderMediaSoup>
        {children}
      </VideoCallProviderMediaSoup>
    )
  }
  
  return (
    <VideoCallProvider>
      {children}
    </VideoCallProvider>
  )
}

// Export the hook that works with both providers
export { useVideoCall, useVideoCallSafe } from './video-call-provider'
