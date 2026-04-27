// Main exports - PeerJS (legacy)
export { VideoCallProvider, useVideoCall, useVideoCallSafe } from './video-call-provider'

// Main exports - MediaSoup (new)
export { 
  VideoCallProviderMediaSoup, 
  useVideoCallMediaSoup, 
  useVideoCallMediaSoupSafe 
} from './video-call-provider-mediasoup'

// Provider wrapper with feature flag
export { VideoCallProviderWrapper } from './video-call-provider-wrapper'

export { VideoCallOverlay } from './video-call-overlay'

// Components
export {
  LocalVideo,
  RemoteVideo,
  CallControls,
  DoctorControls,
  CallTimer,
  ConnectionQualityIndicator,
  EndCallDialog,
} from './components'

// Views
export {
  IncomingCallView,
  CallingView,
  ConnectingView,
  ConnectedView,
  MinimizedView,
} from './views'

// Hooks
export {
  usePeerConnection,
  useMediaStream,
  useCallTimer,
  useConnectionQuality,
  useCallRecording,
  useTurnTest,
  useMediasoupConnection,
} from './hooks'

// Re-export types
export type {
  CallStatus,
  ConnectionQuality,
  CallViewMode,
  CallRole,
  CallParticipant,
  CallData,
  MediaState,
  VideoCallContextValue,
} from '@/lib/video-call/types'
