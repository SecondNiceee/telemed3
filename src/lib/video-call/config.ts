/**
 * Video Call Configuration
 * PeerJS server runs on port 3002
 * TURN server is hosted on nice-sites.online
 */

export const PEER_SERVER_CONFIG = {
  host: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
  port: 3002,
  path: '/peerjs',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  debug: process.env.NODE_ENV === 'development' ? 2 : 0,
} as const

export const ICE_SERVERS = [
  // STUN server on nice-sites.online
  { urls: 'stun:nice-sites.online:3478' },
  // TURN servers on nice-sites.online
  {
    urls: 'turn:nice-sites.online:3478',
    username: 'testuser',
    credential: 'TestPass123',
  },
  {
    urls: 'turn:nice-sites.online:3478?transport=tcp',
    username: 'testuser',
    credential: 'TestPass123',
  },
  {
    urls: 'turns:nice-sites.online:5349',
    username: 'testuser',
    credential: 'TestPass123',
  },
] as const

export const CALL_TIMEOUTS = {
  /** Время ожидания ответа на звонок (30 сек) */
  CALL_TIMEOUT: 30000,
  /** Интервал переподключения (2 сек) */
  RECONNECT_INTERVAL: 2000,
  /** Максимальное количество попыток переподключения */
  MAX_RECONNECT_ATTEMPTS: 3,
  /** Интервал проверки качества соединения (3 сек) */
  QUALITY_CHECK_INTERVAL: 3000,
  /** Timeout для TURN теста (5 сек) */
  TURN_TEST_TIMEOUT: 5000,
  /** Задержка перед повторной попыткой получить media (1 сек) */
  MEDIA_RETRY_DELAY: 1000,
} as const

export const MEDIA_CONSTRAINTS = {
  video: {
    ideal: {
      width: { ideal: 1280, min: 320 },
      height: { ideal: 720, min: 240 },
      frameRate: { ideal: 30, min: 15 },
    },
    fallback: {
      width: { ideal: 640, min: 320 },
      height: { ideal: 480, min: 240 },
      frameRate: { ideal: 24, min: 15 },
    },
    // Minimal constraints - just request any video
    minimal: true,
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
} as const

export const CALL_TIMER = {
  /** Время до окончания когда таймер становится жёлтым (5 мин) */
  WARNING_THRESHOLD_SECONDS: 5 * 60,
  /** Время до окончания когда таймер становится красным (1 мин) */
  CRITICAL_THRESHOLD_SECONDS: 60,
} as const
