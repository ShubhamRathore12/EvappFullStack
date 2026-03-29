import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sessionsService } from './sessions.service'
import { authenticate } from '../../middleware/authenticate'

export async function sessionsRoutes(app: FastifyInstance) {
  // Create session after QR validate
  app.post('/', { preHandler: [authenticate] }, async (req, reply) => {
    const { sessionToken } = z.object({ sessionToken: z.string().min(1) }).parse(req.body)
    const user = req.user as any
    const session = await sessionsService.create(user.sub, sessionToken)
    return reply.status(201).send(session)
  })

  // Get session by ID (with 5s Redis cache for polling)
  app.get('/:id', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 120, timeWindow: '1m' } },
  }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const user = req.user as any
    const session = await sessionsService.getById(id, user.sub)
    return reply.send(session)
  })

  // Stop session
  app.patch('/:id/stop', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const user = req.user as any
    const session = await sessionsService.stop(id, user.sub)
    return reply.send(session)
  })

  // Get active session
  app.get('/active', { preHandler: [authenticate] }, async (req, reply) => {
    const user = req.user as any
    const session = await sessionsService.getActive(user.sub)
    return reply.send(session)
  })

  // Session history
  app.get('/history', { preHandler: [authenticate] }, async (req, reply) => {
    const { page, limit } = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(50).default(20),
    }).parse(req.query)

    const user = req.user as any
    const result = await sessionsService.getHistory(user.sub, page, limit)
    return reply.send(result)
  })
}
