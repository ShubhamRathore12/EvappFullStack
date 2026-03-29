import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { env } from './config/env'
import { redis } from './config/redis'
import { authRoutes } from './modules/auth/auth.routes'
import { stationsRoutes } from './modules/stations/stations.routes'
import { qrRoutes } from './modules/qr/qr.routes'
import { sessionsRoutes } from './modules/sessions/sessions.routes'
import { paymentsRoutes } from './modules/payments/payments.routes'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    trustProxy: true,
    requestIdHeader: 'x-request-id',
  })

  // ─── Security plugins ─────────────────────────────────────────────────────
  await app.register(helmet, { global: true })

  await app.register(cors, {
    origin: env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // ─── Rate limiting (backed by Redis) ──────────────────────────────────────
  await app.register(rateLimit, {
    global: true,
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    redis,
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please slow down.',
    }),
  })

  // ─── JWT ──────────────────────────────────────────────────────────────────
  await app.register(jwt, {
    secret: {
      private: env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      public: env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
    },
    sign: { algorithm: 'RS256' },
  })

  // ─── OpenAPI docs (dev only) ──────────────────────────────────────────────
  if (env.NODE_ENV !== 'production') {
    await app.register(swagger, {
      openapi: {
        info: { title: 'EV Charge API', version: '1.0.0', description: 'EV Charging Station API' },
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
        },
      },
    })
    await app.register(swaggerUi, { routePrefix: '/docs' })
  }

  // ─── Health checks ────────────────────────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  app.get('/ready', async () => {
    // Verify DB + Redis connectivity
    await redis.ping()
    return { status: 'ready' }
  })

  // ─── API routes ───────────────────────────────────────────────────────────
  await app.register(
    async (api) => {
      await api.register(authRoutes, { prefix: '/auth' })
      await api.register(stationsRoutes, { prefix: '/stations' })
      await api.register(qrRoutes, { prefix: '/qr' })
      await api.register(sessionsRoutes, { prefix: '/sessions' })
      await api.register(paymentsRoutes, { prefix: '/payments' })
    },
    { prefix: '/api/v1' }
  )

  // ─── Global error handler ──────────────────────────────────────────────────
  app.setErrorHandler((error, _req, reply) => {
    const statusCode = error.statusCode ?? 500
    if (statusCode >= 500) {
      app.log.error({ err: error }, 'Internal server error')
    }
    reply.status(statusCode).send({
      statusCode,
      error: error.name ?? 'Error',
      message: statusCode >= 500 ? 'Internal server error' : error.message,
    })
  })

  return app
}
