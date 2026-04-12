import type { Socket } from 'socket.io'

export interface AuthenticatedSocket extends Socket {
  data: {
    userId?: number
    doctorId?: number
    senderType: 'user' | 'doctor'
    senderId: number
    // Track rooms where user is typing (for cleanup on disconnect)
    typingInRooms: Set<string>
  }
}

export interface SendMessagePayload {
  appointmentId: number
  text: string
  preferredSenderType?: 'user' | 'doctor'
  attachmentId?: number
}

export interface JoinRoomPayload {
  appointmentId: number
  preferredSenderType?: 'user' | 'doctor'
}

export interface MarkReadPayload {
  appointmentId: number
  preferredSenderType?: 'user' | 'doctor'
}

// Video call signaling types
export interface CallSignalPayload {
  appointmentId: number
  callerPeerId: string
  callerName: string
}

export interface CallAnswerPayload {
  appointmentId: number
  answerPeerId: string
}

export interface CallRejectPayload {
  appointmentId: number
}

export interface CallEndPayload {
  appointmentId: number
}

// Reconnection types
export interface CallParticipantLeavingPayload {
  appointmentId: number
  participantType: 'user' | 'doctor'
}

export interface CallParticipantRejoiningPayload {
  appointmentId: number
  participantType: 'user' | 'doctor'
  peerId: string
}
