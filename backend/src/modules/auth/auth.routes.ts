import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authService } from './auth.service'
import { authenticate } from '../../middleware/authenticate'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post('/register', {
    config: { rateLimit: { max: 3, timeWindow: '1h' } },
  }, async (req, reply) => {
    const body = registerSchema.parse(req.body)
    const result = await authService.register(body)
    return reply.status(201).send(result)
  })

  // Login
  app.post('/login', {
    config: { rateLimit: { max: 5, timeWindow: '15m' } },
  }, async (req, reply) => {
    const body = loginSchema.parse(req.body)
    const ip = req.ip
    const deviceInfo = req.headers['user-agent']
    const result = await authService.login({ ...body, ip, deviceInfo })
    return reply.send(result)
  })

  // Refresh token
  app.post('/refresh', async (req, reply) => {
    const { refreshToken } = req.body as { refreshToken: string }
    if (!refreshToken) {
      return reply.status(400).send({ message: 'refreshToken required' })
    }
    const result = await authService.refreshTokens(refreshToken)
    return reply.send(result)
  })

  // Logout (requires auth)
  app.post('/logout', { preHandler: [authenticate] }, async (req, reply) => {
    const { refreshToken } = req.body as { refreshToken: string }
    const user = req.user as any
    await authService.logout(user.sub, refreshToken, user.jti)
    return reply.status(204).send()
  })

  // Get current user
  app.get('/me', { preHandler: [authenticate] }, async (req, reply) => {
    const user = req.user as any
    const profile = await authService.getMe(user.sub)
    return reply.send(profile)
  })
}
