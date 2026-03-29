import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { paymentsService } from './payments.service'
import { authenticate } from '../../middleware/authenticate'

export async function paymentsRoutes(app: FastifyInstance) {
  // Create PaymentIntent (called before showing Stripe payment sheet)
  app.post('/intent', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 10, timeWindow: '1m' } },
  }, async (req, reply) => {
    const { sessionId } = z.object({ sessionId: z.string().uuid() }).parse(req.body)
    const user = req.user as any
    const result = await paymentsService.createIntent(sessionId, user.sub)
    return reply.send(result)
  })

  // Confirm payment + activate charger
  app.post('/confirm', { preHandler: [authenticate] }, async (req, reply) => {
    const { sessionId, paymentIntentId } = z
      .object({ sessionId: z.string().uuid(), paymentIntentId: z.string() })
      .parse(req.body)
    const user = req.user as any
    const result = await paymentsService.confirmAndActivate(sessionId, paymentIntentId, user.sub)
    return reply.send(result)
  })

  // Stripe webhook (no auth - uses webhook signature verification)
  app.post('/webhook', {
    config: { rawBody: true },
  }, async (req, reply) => {
    const sig = req.headers['stripe-signature'] as string
    await paymentsService.handleWebhook(req.rawBody as Buffer, sig)
    return reply.status(200).send({ received: true })
  })
}
