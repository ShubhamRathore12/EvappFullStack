import { FastifyRequest, FastifyReply } from 'fastify'
import { redis, RedisKeys } from '../config/redis'

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()

    const payload = req.user as any
    // Check if token's jti is blacklisted (logged out)
    if (payload.jti) {
      const isBlacklisted = await redis.exists(RedisKeys.tokenBlacklist(payload.jti))
      if (isBlacklisted) {
        return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Token revoked' })
      }
    }
  } catch (err) {
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid or expired token' })
  }
}
