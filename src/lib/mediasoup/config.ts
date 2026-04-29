/**
 * MediaSoup Server Configuration
 * 
 * This configuration is used for the SFU (Selective Forwarding Unit) server.
 * The server handles WebRTC media routing and enables server-side recording.
 */

import type { WorkerSettings, RouterOptions, WebRtcServerOptions, WebRtcTransportOptions } from 'mediasoup/node/lib/types'
import os from 'os'

// Get the server's public IP - will be set from environment or detected
const ANNOUNCED_IP = process.env.MEDIASOUP_ANNOUNCED_IP || '127.0.0.1'
const LISTEN_IP = process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0'

/**
 * MediaSoup Worker settings
 * Workers are separate processes that handle media
 * 
 * Port range calculation for telemedicine:
 * - 1 call = ~8 ports (2 participants × 4 streams each)
 * - 50 concurrent calls = ~400 ports
 * - Default range: 40000-40499 (500 ports = ~60 concurrent calls)
 * - Can be expanded via environment variables if needed
 */
export const workerSettings: WorkerSettings = {
  logLevel: (process.env.MEDIASOUP_LOG_LEVEL as 'debug' | 'warn' | 'error' | 'none') || 'warn',
  logTags: [
    'info',
    'ice',
    'dtls',
    'rtp',
    'srtp',
    'rtcp',
  ],
  rtcMinPort: parseInt(process.env.MEDIASOUP_RTC_MIN_PORT || '40000', 10),
  rtcMaxPort: parseInt(process.env.MEDIASOUP_RTC_MAX_PORT || '40499', 10),
}

/**
 * Number of MediaSoup workers to create
 * Usually equal to the number of CPU cores
 */
export const numWorkers = Math.min(
  parseInt(process.env.MEDIASOUP_NUM_WORKERS || '0', 10) || os.cpus().length,
  os.cpus().length
)

/**
 * Router options - defines media codecs supported by the server
 */
export const routerOptions: RouterOptions = {
  mediaCodecs: [
    {
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000,
      },
    },
    {
      kind: 'video',
      mimeType: 'video/VP9',
      clockRate: 90000,
      parameters: {
        'profile-id': 2,
        'x-google-start-bitrate': 1000,
      },
    },
    {
      kind: 'video',
      mimeType: 'video/h264',
      clockRate: 90000,
      parameters: {
        'packetization-mode': 1,
        'profile-level-id': '4d0032',
        'level-asymmetry-allowed': 1,
        'x-google-start-bitrate': 1000,
      },
    },
    {
      kind: 'video',
      mimeType: 'video/h264',
      clockRate: 90000,
      parameters: {
        'packetization-mode': 1,
        'profile-level-id': '42e01f',
        'level-asymmetry-allowed': 1,
        'x-google-start-bitrate': 1000,
      },
    },
  ],
}

/**
 * WebRTC Server options for bundled ICE/DTLS/RTP
 */
export const webRtcServerOptions: WebRtcServerOptions = {
  listenInfos: [
    {
      protocol: 'udp',
      ip: LISTEN_IP,
      announcedAddress: ANNOUNCED_IP,
      port: parseInt(process.env.MEDIASOUP_WEBRTC_PORT || '44444', 10),
    },
    {
      protocol: 'tcp',
      ip: LISTEN_IP,
      announcedAddress: ANNOUNCED_IP,
      port: parseInt(process.env.MEDIASOUP_WEBRTC_PORT || '44444', 10),
    },
  ],
}

/**
 * WebRTC Transport options
 */
export const webRtcTransportOptions: WebRtcTransportOptions = {
  listenInfos: [
    {
      protocol: 'udp',
      ip: LISTEN_IP,
      announcedAddress: ANNOUNCED_IP,
    },
    {
      protocol: 'tcp',
      ip: LISTEN_IP,
      announcedAddress: ANNOUNCED_IP,
    },
  ],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
  initialAvailableOutgoingBitrate: 1000000,
  minimumAvailableOutgoingBitrate: 600000,
  maxSctpMessageSize: 262144,
  maxIncomingBitrate: 1500000,
}

/**
 * Plain RTP Transport options (for recording with FFmpeg)
 */
export const plainTransportOptions = {
  listenInfo: {
    protocol: 'udp' as const,
    ip: LISTEN_IP,
    announcedAddress: ANNOUNCED_IP,
  },
  rtcpMux: false,
  comedia: false,
}

/**
 * Server configuration
 */
export const serverConfig = {
  port: parseInt(process.env.MEDIASOUP_PORT || '3002', 10),
  corsOrigins: process.env.MEDIASOUP_CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'https://smartcardio.ru'],
}

/**
 * Recording configuration
 */
export const recordingConfig = {
  // Directory to store recordings
  outputDir: process.env.RECORDING_OUTPUT_DIR || '/tmp/mediasoup-recordings',
  // FFmpeg path
  ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  // Recording format
  format: 'webm',
  // Video codec for recording
  videoCodec: 'libvpx-vp9',
  // Audio codec for recording
  audioCodec: 'libopus',
}
