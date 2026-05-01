'use client'

/**
 * VideoCallProviderWrapper
 * 
 * Обертка для выбора между PeerJS и MediaSoup провайдерами.
 * Используйте env переменную NEXT_PUBLIC_USE_MEDIASOUP=true для включения MediaSoup.
 */

import type { ReactNode } from 'react'
import { VideoCallProvider, useVideoCall as usePeerJSVideoCall, useVideoCallSafe as usePeerJSVideoCallSafe } from './video-call-provider'
import { VideoCallProviderMediaSoup, useVideoCallMediaSoup, useVideoCallMediaSoupSafe } from './video-call-provider-mediasoup'

interface VideoCallProviderWrapperProps {
  children: ReactNode
}

// Feature flag для включения MediaSoup
export const USE_MEDIASOUP = process.env.NEXT_PUBLIC_USE_MEDIASOUP === 'true'

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

// Universal hook that works with both providers
export function useVideoCall() {
  if (USE_MEDIASOUP) {
    return useVideoCallMediaSoup()
  }
  return usePeerJSVideoCall()
}

// Universal safe hook that works with both providers
export function useVideoCallSafe() {
  if (USE_MEDIASOUP) {
    return useVideoCallMediaSoupSafe()
  }
  return usePeerJSVideoCallSafe()
}
