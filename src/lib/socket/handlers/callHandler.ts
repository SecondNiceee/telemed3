import type { Server as SocketIOServer } from 'socket.io'
import type { 
  AuthenticatedSocket, 
  CallSignalPayload, 
  CallAnswerPayload, 
  CallRejectPayload, 
  CallEndPayload,
  CallParticipantLeavingPayload,
  CallParticipantRejoiningPayload,
} from '../types'
import { 
  addActiveCall, 
  removeActiveCall, 
  getActiveCallsForTarget,
  updateActiveCallTargetId,
  type ActiveCall 
} from '../stores/activeCallsStore'

/**
 * Check for pending incoming calls when a user connects
 * This handles the case where someone refreshes the page during an incoming call
 * or connects after the call was initiated
 */
export function checkPendingCallsForSocket(socket: AuthenticatedSocket): void {
  // Pass both senderType and senderId to filter calls for this specific user
  const pendingCalls = getActiveCallsForTarget(socket.data.senderType, socket.data.senderId)
  
  console.log(`[Socket] Checking pending calls for ${socket.data.senderType}:${socket.data.senderId}`)
  console.log(`[Socket] Found ${pendingCalls.length} pending calls`)
  
  for (const call of pendingCalls) {
    // Update targetId if it was null (user wasn't connected when call was initiated)
    if (call.targetId === null) {
      updateActiveCallTargetId(call.appointmentId, socket.data.senderId)
    }
    
    console.log(`[Socket] Sending pending incoming-call for appointment ${call.appointmentId} to ${socket.id}`)
    socket.emit('incoming-call', {
      appointmentId: call.appointmentId,
      callerPeerId: call.callerPeerId,
      callerName: call.callerName,
      callerType: call.callerType,
      callerId: call.callerId,
    })
  }
}

/**
 * Handle initiating a call - notify the other party directly
 * This works even if the other party is not in the appointment room
 */
export function createCallHandler(io: SocketIOServer) {
  return (socket: AuthenticatedSocket, data: CallSignalPayload) => {
    const { appointmentId, callerPeerId, callerName } = data
    const roomName = `appointment:${appointmentId}`
    
    console.log(`[Socket] ====== CALL INITIATE ======`)
    console.log(`[Socket] Call initiated by ${socket.data.senderType}:${socket.data.senderId}, peerId: ${callerPeerId}`)
    console.log(`[Socket] callerName: ${callerName}`)
    console.log(`[Socket] Total connected sockets: ${io.sockets.sockets.size}`)
    
    // Determine who we need to call based on the caller type
    const targetType = socket.data.senderType === 'doctor' ? 'user' : 'doctor'
    
    // First, try to send to the room (if target is already in the chat)
    const room = io.sockets.adapter.rooms.get(roomName)
    const roomSize = room ? room.size : 0
    console.log(`[Socket] Room ${roomName} has ${roomSize} clients`)
    
    // Track target IDs we find to store in activeCall
    const targetIds: number[] = []
    
    // Broadcast to room (this catches the case where target is already viewing the chat)
    // Also collect targetIds from room members
    if (room) {
      for (const socketId of room) {
        if (socketId === socket.id) continue
        const roomSocket = io.sockets.sockets.get(socketId) as AuthenticatedSocket | undefined
        if (roomSocket && roomSocket.data.senderType === targetType) {
          targetIds.push(roomSocket.data.senderId)
        }
      }
    }
    
    socket.to(roomName).emit('incoming-call', {
      appointmentId,
      callerPeerId,
      callerName,
      callerType: socket.data.senderType,
      callerId: socket.data.senderId,
    })
    
    // Additionally, find ALL sockets of the other participant type and notify them
    // This ensures they get the call notification even if not in the room
    // We iterate through all connected sockets to find the right participant
    console.log(`[Socket] Looking for ${targetType} sockets to notify...`)
    let foundTargetSockets = 0
    for (const [socketId, connectedSocket] of io.sockets.sockets) {
      const authSocket = connectedSocket as AuthenticatedSocket
      
      // Skip the caller's own socket
      if (socketId === socket.id) continue
      
      // Skip if already in the room (they already got the event)
      if (room?.has(socketId)) continue
      
      // Check if this is the opposite participant type
      // For simplicity, we send to ALL users if caller is doctor, and ALL doctors if caller is user
      // In production, you'd want to check the actual appointment participants
      console.log(`[Socket] Checking socket ${socketId}: senderType=${authSocket.data.senderType}, senderId=${authSocket.data.senderId}`)
      if (authSocket.data.senderType === targetType) {
        foundTargetSockets++
        // Collect targetId
        if (!targetIds.includes(authSocket.data.senderId)) {
          targetIds.push(authSocket.data.senderId)
        }
        console.log(`[Socket] *** MATCH! Sending incoming-call to ${targetType}:${authSocket.data.senderId} (socket: ${socketId})`)
        authSocket.emit('incoming-call', {
          appointmentId,
          callerPeerId,
          callerName,
          callerType: socket.data.senderType,
          callerId: socket.data.senderId,
        })
      }
    }
    
    // Store the active call so new connections can receive it
    // Use the first targetId found (if any) - in production this should come from appointment data
    const targetId = targetIds.length > 0 ? targetIds[0] : null
    console.log(`[Socket] Storing active call with targetType=${targetType}, targetId=${targetId}`)
    
    const activeCall: ActiveCall = {
      appointmentId,
      callerPeerId,
      callerName,
      callerType: socket.data.senderType,
      callerId: socket.data.senderId,
      targetType,
      targetId,
      createdAt: Date.now(),
    }
    addActiveCall(activeCall)
    
    console.log(`[Socket] Found ${foundTargetSockets} ${targetType} sockets to notify`)
    console.log(`[Socket] Emitted incoming-call to room ${roomName} and all ${targetType} sockets`)
    console.log(`[Socket] ====== END CALL INITIATE ======`)
  }
}

/**
 * Helper to broadcast call event to all sockets of the opposite participant type
 */
function broadcastToOtherParticipant(
  io: SocketIOServer,
  socket: AuthenticatedSocket,
  roomName: string,
  eventName: string,
  eventData: Record<string, unknown>
) {
  const targetType = socket.data.senderType === 'doctor' ? 'user' : 'doctor'
  const room = io.sockets.adapter.rooms.get(roomName)
  
  // First broadcast to room
  socket.to(roomName).emit(eventName, eventData)
  
  // Then send to all sockets of the target type that are not in the room
  for (const [socketId, connectedSocket] of io.sockets.sockets) {
    const authSocket = connectedSocket as AuthenticatedSocket
    if (socketId === socket.id) continue
    if (room?.has(socketId)) continue
    if (authSocket.data.senderType === targetType) {
      authSocket.emit(eventName, eventData)
    }
  }
}

/**
 * Handle call answer - notify the caller that the call was answered
 */
export function createCallAnswerHandler(io: SocketIOServer) {
  return (socket: AuthenticatedSocket, data: CallAnswerPayload) => {
    const { appointmentId, answerPeerId } = data
    const roomName = `appointment:${appointmentId}`
    
    console.log(`[Socket] Call answered by ${socket.data.senderType}:${socket.data.senderId}, peerId: ${answerPeerId}`)
    
    // Remove from active calls - the call is now connected
    removeActiveCall(appointmentId)
    
    // Broadcast to the caller (who might not be in the room)
    broadcastToOtherParticipant(io, socket, roomName, 'call-answered', {
      appointmentId,
      answerPeerId,
      answererType: socket.data.senderType,
      answererId: socket.data.senderId,
    })
  }
}

/**
 * Handle call rejection
 */
export function createCallRejectHandler(io: SocketIOServer) {
  return (socket: AuthenticatedSocket, data: CallRejectPayload) => {
    const { appointmentId } = data
    const roomName = `appointment:${appointmentId}`
    
    console.log(`[Socket] Call rejected by ${socket.data.senderType}:${socket.data.senderId}`)
    
    // Remove from active calls
    removeActiveCall(appointmentId)
    
    broadcastToOtherParticipant(io, socket, roomName, 'call-rejected', {
      appointmentId,
      rejectedBy: socket.data.senderType,
    })
  }
}

/**
 * Handle call end
 */
export function createCallEndHandler(io: SocketIOServer) {
  return (socket: AuthenticatedSocket, data: CallEndPayload) => {
    const { appointmentId } = data
    const roomName = `appointment:${appointmentId}`
    
    console.log(`[Socket] Call ended by ${socket.data.senderType}:${socket.data.senderId}`)
    
    // Remove from active calls
    removeActiveCall(appointmentId)
    
    broadcastToOtherParticipant(io, socket, roomName, 'call-ended', {
      appointmentId,
      endedBy: socket.data.senderType,
    })
  }
}

/**
 * Handle participant leaving (page close/navigate away during call)
 */
export function createCallParticipantLeavingHandler(io: SocketIOServer) {
  return (socket: AuthenticatedSocket, data: CallParticipantLeavingPayload) => {
    const { appointmentId, participantType } = data
    const roomName = `appointment:${appointmentId}`
    
    console.log(`[Socket] Participant ${participantType} leaving call in room ${roomName}`)
    
    socket.to(roomName).emit('call-participant-left', {
      appointmentId,
      participantType,
    })
  }
}

/**
 * Handle participant rejoining (returning to page during active call)
 */
export function createCallParticipantRejoiningHandler(io: SocketIOServer) {
  return (socket: AuthenticatedSocket, data: CallParticipantRejoiningPayload) => {
    const { appointmentId, participantType, peerId } = data
    const roomName = `appointment:${appointmentId}`
    
    console.log(`[Socket] Participant ${participantType} rejoining call in room ${roomName} with peerId ${peerId}`)
    
    socket.to(roomName).emit('call-participant-rejoined', {
      appointmentId,
      participantType,
      peerId,
    })
  }
}
