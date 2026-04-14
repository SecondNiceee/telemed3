import type { Server as SocketIOServer } from 'socket.io'
import type { Payload } from 'payload'
import type { 
  AuthenticatedSocket, 
  ConsultationStartPayload, 
  ConsultationEndPayload,
  ChatBlockPayload,
} from '../types'
import isValidAppointmentId from '../utils/isValidAppointmentId'
import verifyAppointmentAccess from '../utils/verifyAppointmentAccess'

/**
 * Handle consultation start event
 * Only doctors can start consultations
 */
export function createConsultationStartHandler(io: SocketIOServer, payload: Payload) {
  return async (socket: AuthenticatedSocket, data: ConsultationStartPayload) => {
    const { appointmentId } = data
    const { senderType, senderId } = socket.data

    // Only doctors can start consultations
    if (senderType !== 'doctor') {
      socket.emit('error', { message: 'Only doctors can start consultations' })
      return
    }

    if (!isValidAppointmentId(appointmentId)) {
      socket.emit('error', { message: 'Invalid appointment ID' })
      return
    }

    // Verify the doctor has access to this appointment
    const accessResult = await verifyAppointmentAccess(payload, appointmentId, undefined, senderId)
    if (!accessResult.hasAccess) {
      socket.emit('error', { message: 'Access denied to this appointment' })
      return
    }

    try {
      // Update appointment status to in_progress
      await payload.update({
        collection: 'appointments',
        id: appointmentId,
        data: { status: 'in_progress' },
        overrideAccess: true,
      })

      // Emit to all clients in the room
      const room = `appointment:${appointmentId}`
      io.to(room).emit('consultation-started', { appointmentId })
      
      console.log(`[Socket] Consultation started for appointment ${appointmentId} by doctor ${senderId}`)
    } catch (error) {
      console.error('[Socket] Failed to start consultation:', error)
      socket.emit('error', { message: 'Failed to start consultation' })
    }
  }
}

/**
 * Handle consultation end event
 * Only doctors can end consultations
 */
export function createConsultationEndHandler(io: SocketIOServer, payload: Payload) {
  return async (socket: AuthenticatedSocket, data: ConsultationEndPayload) => {
    const { appointmentId } = data
    const { senderType, senderId } = socket.data

    // Only doctors can end consultations
    if (senderType !== 'doctor') {
      socket.emit('error', { message: 'Only doctors can end consultations' })
      return
    }

    if (!isValidAppointmentId(appointmentId)) {
      socket.emit('error', { message: 'Invalid appointment ID' })
      return
    }

    // Verify the doctor has access to this appointment
    const accessResult = await verifyAppointmentAccess(payload, appointmentId, undefined, senderId)
    if (!accessResult.hasAccess) {
      socket.emit('error', { message: 'Access denied to this appointment' })
      return
    }

    try {
      // Update appointment status to completed
      await payload.update({
        collection: 'appointments',
        id: appointmentId,
        data: { status: 'completed' },
        overrideAccess: true,
      })

      // Emit to all clients in the room
      const room = `appointment:${appointmentId}`
      io.to(room).emit('consultation-ended', { appointmentId })
      
      console.log(`[Socket] Consultation ended for appointment ${appointmentId} by doctor ${senderId}`)
    } catch (error) {
      console.error('[Socket] Failed to end consultation:', error)
      socket.emit('error', { message: 'Failed to end consultation' })
    }
  }
}

/**
 * Handle chat block event
 * Only doctors can block chat (after consultation is completed)
 */
export function createChatBlockHandler(io: SocketIOServer, payload: Payload) {
  return async (socket: AuthenticatedSocket, data: ChatBlockPayload) => {
    const { appointmentId } = data
    const { senderType, senderId } = socket.data

    // Only doctors can block chat
    if (senderType !== 'doctor') {
      socket.emit('error', { message: 'Only doctors can block chat' })
      return
    }

    if (!isValidAppointmentId(appointmentId)) {
      socket.emit('error', { message: 'Invalid appointment ID' })
      return
    }

    // Verify the doctor has access to this appointment
    const accessResult = await verifyAppointmentAccess(payload, appointmentId, undefined, senderId)
    if (!accessResult.hasAccess) {
      socket.emit('error', { message: 'Access denied to this appointment' })
      return
    }

    try {
      // Get current appointment to check if it's completed
      const appointment = await payload.findByID({
        collection: 'appointments',
        id: appointmentId,
        overrideAccess: true,
      })

      if (appointment.status !== 'completed') {
        socket.emit('error', { message: 'Can only block chat for completed consultations' })
        return
      }

      // Update appointment to block chat
      await payload.update({
        collection: 'appointments',
        id: appointmentId,
        data: { chatBlocked: true },
        overrideAccess: true,
      })

      // Emit to all clients in the room
      const room = `appointment:${appointmentId}`
      io.to(room).emit('chat-blocked', { appointmentId })
      
      console.log(`[Socket] Chat blocked for appointment ${appointmentId} by doctor ${senderId}`)
    } catch (error) {
      console.error('[Socket] Failed to block chat:', error)
      socket.emit('error', { message: 'Failed to block chat' })
    }
  }
}
