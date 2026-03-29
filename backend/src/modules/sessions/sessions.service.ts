import { db } from '../../config/database'
import { redis, RedisKeys } from '../../config/redis'

// In-memory token store for session creation tokens
// In production use Redis with TTL
const sessionTokens = new Map<string, { connectorId: string; stationId: string; createdAt: number }>()

export function registerSessionToken(
  token: string,
  connectorId: string,
  stationId: string
) {
  sessionTokens.set(token, { connectorId, stationId, createdAt: Date.now() })
  // Auto-expire after 10 minutes
  setTimeout(() => sessionTokens.delete(token), 10 * 60 * 1000)
}

function formatSession(s: any) {
  return {
    id: s.id,
    userId: s.userId,
    connectorId: s.connectorId,
    stationId: s.stationId,
    status: s.status,
    startedAt: s.startedAt?.toISOString(),
    endedAt: s.endedAt?.toISOString(),
    energyKwh: Number(s.energyKwh),
    durationMinutes: s.durationMinutes,
    totalCost: Number(s.totalCost),
    stationName: s.station?.name ?? '',
    portNumber: s.connector?.portNumber ?? 0,
    connectorType: s.connector?.connectorType ?? '',
    powerKw: Number(s.connector?.powerKw ?? 0),
    payment: s.payment
      ? {
          id: s.payment.id,
          sessionId: s.payment.sessionId,
          amount: Number(s.payment.amount),
          currency: s.payment.currency,
          status: s.payment.status,
          capturedAmount: s.payment.capturedAmount ? Number(s.payment.capturedAmount) : undefined,
        }
      : undefined,
  }
}

const SESSION_INCLUDE = {
  station: { select: { name: true } },
  connector: { select: { portNumber: true, connectorType: true, powerKw: true } },
  payment: {
    select: {
      id: true, sessionId: true, amount: true, currency: true, status: true, capturedAmount: true,
    },
  },
}

export const sessionsService = {
  async create(userId: string, sessionToken: string) {
    // For now: token carries connectorId + stationId
    // In production: validate token from Redis with TTL
    // We'll look up the connector directly from DB using a heuristic
    // (In real flow, qrService.validate would store the token in Redis)

    // Find any available connector (simplified - in production use stored token)
    // This should be replaced with: const info = await redis.get(`session_token:${sessionToken}`)
    const connector = await db.connector.findFirst({
      where: { status: 'AVAILABLE' },
      include: { station: true },
    })

    if (!connector) {
      const err = new Error('No available connectors') as any
      err.statusCode = 422
      throw err
    }

    // Check no active session for this user
    const existingActive = await db.chargingSession.findFirst({
      where: { userId, status: { in: ['PENDING_PAYMENT', 'PAYMENT_AUTHORIZED', 'STARTING', 'ACTIVE'] } },
    })

    if (existingActive) {
      const err = new Error('You already have an active session') as any
      err.statusCode = 409
      throw err
    }

    const session = await db.chargingSession.create({
      data: {
        userId,
        connectorId: connector.id,
        stationId: connector.stationId,
        status: 'PENDING_PAYMENT',
      },
      include: SESSION_INCLUDE,
    })

    return formatSession(session)
  },

  async getById(id: string, userId: string) {
    // Check Redis cache first (reduces DB load during 5s polling)
    const cacheKey = RedisKeys.sessionCache(id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed.userId !== userId) {
        const err = new Error('Forbidden') as any
        err.statusCode = 403
        throw err
      }
      return parsed
    }

    const session = await db.chargingSession.findUnique({
      where: { id },
      include: SESSION_INCLUDE,
    })

    if (!session) {
      const err = new Error('Session not found') as any
      err.statusCode = 404
      throw err
    }

    if (session.userId !== userId) {
      const err = new Error('Forbidden') as any
      err.statusCode = 403
      throw err
    }

    const result = formatSession(session)

    // Cache for 5 seconds (matches polling interval)
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 5)

    return result
  },

  async stop(id: string, userId: string) {
    const session = await db.chargingSession.findUnique({ where: { id } })

    if (!session || session.userId !== userId) {
      const err = new Error('Session not found') as any
      err.statusCode = 404
      throw err
    }

    if (!['ACTIVE', 'STARTING'].includes(session.status)) {
      const err = new Error('Session cannot be stopped in current state') as any
      err.statusCode = 422
      throw err
    }

    const startedAt = session.startedAt ?? new Date()
    const durationMinutes = Math.floor((Date.now() - startedAt.getTime()) / 60000)

    const updated = await db.chargingSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        durationMinutes,
        stoppedReason: 'USER_STOPPED',
      },
      include: SESSION_INCLUDE,
    })

    // Update connector status back to AVAILABLE
    await db.connector.update({
      where: { id: session.connectorId },
      data: { status: 'AVAILABLE' },
    })

    // Invalidate cache
    await redis.del(RedisKeys.sessionCache(id))

    return formatSession(updated)
  },

  async getActive(userId: string) {
    const session = await db.chargingSession.findFirst({
      where: {
        userId,
        status: { in: ['PAYMENT_AUTHORIZED', 'STARTING', 'ACTIVE', 'STOPPING'] },
      },
      include: SESSION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })

    return session ? formatSession(session) : null
  },

  async getHistory(userId: string, page: number, limit: number) {
    const [data, total] = await Promise.all([
      db.chargingSession.findMany({
        where: { userId, status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] } },
        include: SESSION_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.chargingSession.count({
        where: { userId, status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] } },
      }),
    ])

    return {
      data: data.map(formatSession),
      total,
      page,
      limit,
      hasMore: page * limit < total,
    }
  },
}
