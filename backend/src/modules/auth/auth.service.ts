import * as argon2 from 'argon2'
import { randomBytes, createHmac, timingSafeEqual } from 'crypto'
import { db } from '../../config/database'
import { redis, RedisKeys } from '../../config/redis'
import { env } from '../../config/env'

type FastifyInstance = import('fastify').FastifyInstance

// We'll use the server's jwt instance passed as a factory
let _jwtSign: (payload: object, opts?: object) => string
let _jwtVerify: (token: string) => any

export function initJwt(sign: typeof _jwtSign, verify: typeof _jwtVerify) {
  _jwtSign = sign
  _jwtVerify = verify
}

function generateRefreshToken(): string {
  return randomBytes(48).toString('hex')
}

function hashRefreshToken(token: string): string {
  return createHmac('sha256', env.QR_HMAC_SECRET).update(token).digest('hex')
}

async function signAccessToken(payload: object): Promise<string> {
  // We access jwt from the Fastify server instance via closure
  // This is injected via initJwt from server bootstrap
  return (_jwtSign as any)(payload)
}

export const authService = {
  async register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) {
    const existing = await db.user.findUnique({ where: { email: data.email } })
    if (existing) {
      const err = new Error('Email already registered') as any
      err.statusCode = 409
      throw err
    }

    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    })

    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone,
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, isEmailVerified: true, createdAt: true,
      },
    })

    const rawRefresh = generateRefreshToken()
    const tokenHash = hashRefreshToken(rawRefresh)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await db.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    })

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      jti: randomBytes(16).toString('hex'),
    })

    return { accessToken, refreshToken: rawRefresh, user }
  },

  async login(data: {
    email: string
    password: string
    ip?: string
    deviceInfo?: string | string[]
  }) {
    const user = await db.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })

    if (!user || !user.isActive) {
      // Timing-safe: still hash even if user not found to prevent enumeration
      await argon2.hash('dummy-password-to-prevent-timing-attack')
      const err = new Error('Invalid email or password') as any
      err.statusCode = 401
      throw err
    }

    const valid = await argon2.verify(user.passwordHash, data.password)
    if (!valid) {
      const err = new Error('Invalid email or password') as any
      err.statusCode = 401
      throw err
    }

    const rawRefresh = generateRefreshToken()
    const tokenHash = hashRefreshToken(rawRefresh)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await db.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        ipAddress: data.ip,
        deviceInfo: typeof data.deviceInfo === 'string' ? data.deviceInfo : undefined,
      },
    })

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      jti: randomBytes(16).toString('hex'),
    })

    const { passwordHash: _, ...safeUser } = user
    return { accessToken, refreshToken: rawRefresh, user: safeUser }
  },

  async refreshTokens(rawToken: string) {
    const tokenHash = hashRefreshToken(rawToken)

    const stored = await db.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } } },
    })

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // Token reuse or expired: revoke ALL tokens for this user (security measure)
      if (stored) {
        await db.refreshToken.updateMany({
          where: { userId: stored.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        })
      }
      const err = new Error('Invalid or expired refresh token') as any
      err.statusCode = 401
      throw err
    }

    if (!stored.user.isActive) {
      const err = new Error('Account deactivated') as any
      err.statusCode = 401
      throw err
    }

    // Rotate: revoke old, create new
    await db.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    })

    const newRawRefresh = generateRefreshToken()
    const newHash = hashRefreshToken(newRawRefresh)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await db.refreshToken.create({
      data: { userId: stored.userId, tokenHash: newHash, expiresAt },
    })

    const accessToken = await signAccessToken({
      sub: stored.userId,
      email: stored.user.email,
      jti: randomBytes(16).toString('hex'),
    })

    return { accessToken, refreshToken: newRawRefresh, user: stored.user }
  },

  async logout(userId: string, rawToken: string, jti?: string) {
    const tokenHash = hashRefreshToken(rawToken)

    await db.refreshToken.updateMany({
      where: { userId, tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    // Blacklist the access token's jti until it expires (15m)
    if (jti) {
      await redis.set(RedisKeys.tokenBlacklist(jti), '1', 'EX', 15 * 60)
    }
  },

  async getMe(userId: string) {
    const user = await db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, avatarUrl: true, isEmailVerified: true, createdAt: true,
      },
    })
    return user
  },
}

// Called once from app.ts after jwt plugin is registered
export function configureAuthService(app: { jwt: { sign: any; verify: any } }) {
  _jwtSign = (payload, opts) => app.jwt.sign(payload, opts)
  _jwtVerify = (token) => app.jwt.verify(token)
}
