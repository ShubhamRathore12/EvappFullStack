import IORedis from 'ioredis'
import { env } from './env'

export const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableReadyCheck: true,
})

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message)
})

redis.on('connect', () => {
  console.info('[Redis] Connected')
})

// Key builders
export const RedisKeys = {
  tokenBlacklist: (jti: string) => `blacklist:jti:${jti}`,
  sessionStatus: (sessionId: string) => `session:${sessionId}:status`,
  sessionCache: (sessionId: string) => `session:${sessionId}:cache`,
  nearbyStations: (geohash: string) => `stations:nearby:${geohash}`,
  connectorInfo: (connectorId: string) => `connector:${connectorId}:info`,
  qrCache: (connectorId: string) => `qr:${connectorId}:info`,
  rateLimitLogin: (ip: string) => `rl:login:${ip}`,
  stripeCustomer: (userId: string) => `stripe:customer:${userId}`,
}
