import type { AuthenticatedSocket } from '../types'
import { rateLimitMap } from '../config/rate-limit.config'

export function createDisconnectHandler() {
  return (socket: AuthenticatedSocket) => {
    // Send stop-typing to all rooms where user was typing
    for (const roomName of socket.data.typingInRooms) {
      socket.to(roomName).emit('user-stop-typing', {
        appointmentId: parseInt(roomName.replace('appointment:', ''), 10),
        senderType: socket.data.senderType,
        senderId: socket.data.senderId,
      })
    }
    
    // [RATE LIMITING] Cleanup rate limit entry
    rateLimitMap.delete(socket.id)
    
    console.log(`[Socket] Client disconnected: ${socket.id}`)
  }
}
