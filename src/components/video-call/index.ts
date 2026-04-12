// Main exports
export { VideoCallProvider, useVideoCall, useVideoCallSafe } from './video-call-provider'
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
