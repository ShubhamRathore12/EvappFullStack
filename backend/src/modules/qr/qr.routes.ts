import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { qrService } from './qr.service'
import { authenticate } from '../../middleware/authenticate'

export async function qrRoutes(app: FastifyInstance) {
  app.post('/validate', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 30, timeWindow: '1m' } },
  }, async (req, reply) => {
    const { qrPayload } = z.object({ qrPayload: z.string().min(1) }).parse(req.body)
    const result = await qrService.validate(qrPayload)
    return reply.send(result)
  })
}
