/**
 * MediaSoup SFU Server
 * 
 * This server replaces PeerJS for video calls.
 * It provides:
 * - WebRTC media routing (SFU)
 * - Server-side access to media streams
 * - Foundation for server-side recording
 * 
 * Run with: pnpm mediasoup
 */

import 'dotenv/config'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import type { Socket } from 'socket.io'
import type { RtpCapabilities, DtlsParameters, RtpParameters, MediaKind } from 'mediasoup/node/lib/types'
import { workerManager } from './lib/mediasoup/worker-manager'
import { roomManager } from './lib/mediasoup/room'
import { serverConfig } from './lib/mediasoup/config'

// Socket data interface
interface SocketData {
  peerId?: string
  peerName?: string
  role?: 'doctor' | 'patient'
  roomId?: string
  rtpCapabilities?: RtpCapabilities
}

interface AuthenticatedSocket extends Socket {
  data: SocketData
}

// Start server
async function main() {
  console.log('[MediaSoup] Starting server...')

  // Initialize MediaSoup workers
  await workerManager.initialize()

  // Create HTTP server
  const httpServer = createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', type: 'mediasoup' }))
      return
    }
    res.writeHead(404)
    res.end()
  })

  // Create Socket.IO server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: serverConfig.corsOrigins,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // Socket connection handler
  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket
    console.log(`[MediaSoup] Client connected: ${socket.id}`)

    // ==========================================
    // Room Management
    // ==========================================

    /**
     * Join a room (appointment)
     */
    socket.on('join-room', async (data: {
      roomId: string
      peerId: string
      peerName: string
      role: 'doctor' | 'patient'
    }, callback: (response: { 
      success: boolean
      routerRtpCapabilities?: RtpCapabilities
      error?: string 
    }) => void) => {
      try {
        const { roomId, peerId, peerName, role } = data
        console.log(`[MediaSoup] Peer ${peerId} (${role}) joining room ${roomId}`)

        // Store peer info in socket
        authSocket.data.peerId = peerId
        authSocket.data.peerName = peerName
        authSocket.data.role = role
        authSocket.data.roomId = roomId

        // Join Socket.IO room
        socket.join(roomId)

        // Get or create MediaSoup room
        const room = await roomManager.getOrCreateRoom(roomId)

        // Add peer to room
        await roomManager.addPeer(room, peerId, peerName, role)

        // Return router capabilities
        const routerRtpCapabilities = roomManager.getRouterRtpCapabilities(room)

        callback({
          success: true,
          routerRtpCapabilities,
        })

        // Notify other peers
        socket.to(roomId).emit('peer-joined', { peerId, peerName, role })

      } catch (error) {
        console.error('[MediaSoup] Join room error:', error)
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    })

    /**
     * Leave a room
     */
    socket.on('leave-room', (data: { roomId: string }) => {
      const { roomId } = data
      const peerId = authSocket.data.peerId

      if (peerId && roomId) {
        const room = roomManager.getRoom(roomId)
        if (room) {
          roomManager.removePeer(room, peerId)
          socket.to(roomId).emit('peer-left', { peerId })
        }
        socket.leave(roomId)
      }

      // Clear socket data
      authSocket.data.roomId = undefined
    })

    // ==========================================
    // Transport Management
    // ==========================================

    /**
     * Create WebRTC transport
     */
    socket.on('create-transport', async (data: {
      roomId: string
      direction: 'send' | 'recv'
    }, callback: (response: {
      success: boolean
      transport?: {
        id: string
        iceParameters: unknown
        iceCandidates: unknown
        dtlsParameters: unknown
        sctpParameters?: unknown
      }
      error?: string
    }) => void) => {
      try {
        const { roomId, direction } = data
        const peerId = authSocket.data.peerId

        if (!peerId) {
          throw new Error('Not authenticated')
        }

        const room = roomManager.getRoom(roomId)
        if (!room) {
          throw new Error(`Room ${roomId} not found`)
        }

        const transport = await roomManager.createWebRtcTransport(room, peerId, direction)

        callback({
          success: true,
          transport,
        })

      } catch (error) {
        console.error('[MediaSoup] Create transport error:', error)
        callback({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })

    /**
     * Connect transport (DTLS handshake)
     */
    socket.on('connect-transport', async (data: {
      roomId: string
      transportId: string
      dtlsParameters: DtlsParameters
    }, callback: (response: { success: boolean; error?: string }) => void) => {
      try {
        const { roomId, transportId, dtlsParameters } = data
        const peerId = authSocket.data.peerId

        if (!peerId) {
          throw new Error('Not authenticated')
        }

        const room = roomManager.getRoom(roomId)
        if (!room) {
          throw new Error(`Room ${roomId} not found`)
        }

        await roomManager.connectTransport(room, peerId, transportId, dtlsParameters)

        callback({ success: true })

      } catch (error) {
        console.error('[MediaSoup] Connect transport error:', error)
        callback({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })

    // ==========================================
    // Producer/Consumer Management
    // ==========================================

    /**
     * Create producer (start sending media)
     */
    socket.on('produce', async (data: {
      roomId: string
      transportId: string
      kind: MediaKind
      rtpParameters: RtpParameters
      appData?: Record<string, unknown>
    }, callback: (response: {
      success: boolean
      producerId?: string
      error?: string
    }) => void) => {
      try {
        const { roomId, transportId, kind, rtpParameters, appData } = data
        const peerId = authSocket.data.peerId

        if (!peerId) {
          throw new Error('Not authenticated')
        }

        const room = roomManager.getRoom(roomId)
        if (!room) {
          throw new Error(`Room ${roomId} not found`)
        }

        const { id: producerId } = await roomManager.createProducer(
          room,
          peerId,
          transportId,
          kind,
          rtpParameters,
          appData
        )

        callback({ success: true, producerId })

        // Notify other peers about new producer
        socket.to(roomId).emit('new-producer', {
          producerId,
          producerPeerId: peerId,
          kind,
        })

      } catch (error) {
        console.error('[MediaSoup] Produce error:', error)
        callback({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })

    /**
     * Store RTP capabilities
     */
    socket.on('set-rtp-capabilities', (data: {
      rtpCapabilities: RtpCapabilities
    }) => {
      authSocket.data.rtpCapabilities = data.rtpCapabilities
    })

    /**
     * Consume a producer (receive media from another peer)
     */
    socket.on('consume', async (data: {
      roomId: string
      producerId: string
      producerPeerId: string
    }, callback: (response: {
      success: boolean
      consumer?: {
        id: string
        producerId: string
        kind: MediaKind
        rtpParameters: RtpParameters
        producerPaused: boolean
      }
      error?: string
    }) => void) => {
      try {
        const { roomId, producerId, producerPeerId } = data
        const peerId = authSocket.data.peerId
        const rtpCapabilities = authSocket.data.rtpCapabilities

        if (!peerId || !rtpCapabilities) {
          throw new Error('Not authenticated or RTP capabilities not set')
        }

        const room = roomManager.getRoom(roomId)
        if (!room) {
          throw new Error(`Room ${roomId} not found`)
        }

        const consumer = await roomManager.createConsumer(
          room,
          peerId,
          producerPeerId,
          producerId,
          rtpCapabilities
        )

        if (!consumer) {
          throw new Error('Cannot consume this producer')
        }

        callback({ success: true, consumer })

      } catch (error) {
        console.error('[MediaSoup] Consume error:', error)
        callback({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })

    /**
     * Resume consumer
     */
    socket.on('resume-consumer', async (data: {
      roomId: string
      consumerId: string
    }, callback: (response: { success: boolean; error?: string }) => void) => {
      try {
        const { roomId, consumerId } = data
        const peerId = authSocket.data.peerId

        if (!peerId) {
          throw new Error('Not authenticated')
        }

        const room = roomManager.getRoom(roomId)
        if (!room) {
          throw new Error(`Room ${roomId} not found`)
        }

        await roomManager.resumeConsumer(room, peerId, consumerId)

        callback({ success: true })

      } catch (error) {
        console.error('[MediaSoup] Resume consumer error:', error)
        callback({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })

    /**
     * Get existing producers in room
     */
    socket.on('get-producers', (data: {
      roomId: string
    }, callback: (response: {
      success: boolean
      producers?: Array<{
        producerId: string
        producerPeerId: string
        kind: MediaKind
      }>
      error?: string
    }) => void) => {
      try {
        const { roomId } = data
        const peerId = authSocket.data.peerId

        if (!peerId) {
          throw new Error('Not authenticated')
        }

        const room = roomManager.getRoom(roomId)
        if (!room) {
          callback({ success: true, producers: [] })
          return
        }

        const producers: Array<{
          producerId: string
          producerPeerId: string
          kind: MediaKind
        }> = []

        for (const [pId, peer] of room.peers) {
          if (pId === peerId) continue // Skip own producers

          for (const [producerId, producer] of peer.producers) {
            producers.push({
              producerId,
              producerPeerId: pId,
              kind: producer.kind,
            })
          }
        }

        callback({ success: true, producers })

      } catch (error) {
        console.error('[MediaSoup] Get producers error:', error)
        callback({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })

    // ==========================================
    // Disconnect Handler
    // ==========================================

    socket.on('disconnect', () => {
      const peerId = authSocket.data.peerId
      const roomId = authSocket.data.roomId

      console.log(`[MediaSoup] Client disconnected: ${socket.id}, peerId: ${peerId}`)

      if (peerId && roomId) {
        const room = roomManager.getRoom(roomId)
        if (room) {
          roomManager.removePeer(room, peerId)
          socket.to(roomId).emit('peer-left', { peerId })
        }
      }
    })
  })

  // Start listening
  httpServer.listen(serverConfig.port, () => {
    console.log(`[MediaSoup] Server listening on port ${serverConfig.port}`)
    console.log(`[MediaSoup] CORS origins: ${serverConfig.corsOrigins.join(', ')}`)
  })

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[MediaSoup] Shutting down...')
    
    // Close all rooms
    for (const [roomId] of roomManager.getAllRooms()) {
      roomManager.closeRoom(roomId)
    }
    
    // Close workers
    await workerManager.close()
    
    // Close HTTP server
    httpServer.close()
    
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error) => {
  console.error('[MediaSoup] Fatal error:', error)
  process.exit(1)
})
