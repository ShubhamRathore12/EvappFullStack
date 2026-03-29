import Stripe from 'stripe'
import { db } from '../../config/database'
import { redis, RedisKeys } from '../../config/redis'
import { env } from '../../config/env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })

async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  const cacheKey = RedisKeys.stripeCustomer(userId)
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, email: true } })

  const customers = await stripe.customers.list({ email: user.email, limit: 1 })
  let customerId: string

  if (customers.data.length > 0) {
    customerId = customers.data[0].id
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId },
    })
    customerId = customer.id
  }

  await redis.set(cacheKey, customerId, 'EX', 86400 * 30)
  return customerId
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
        }
      : undefined,
  }
}

export const paymentsService = {
  async createIntent(sessionId: string, userId: string) {
    const session = await db.chargingSession.findUnique({
      where: { id: sessionId },
      include: { connector: true, user: { select: { email: true } } },
    })

    if (!session || session.userId !== userId) {
      const err = new Error('Session not found') as any
      err.statusCode = 404
      throw err
    }

    if (session.status !== 'PENDING_PAYMENT') {
      const err = new Error('Session is not pending payment') as any
      err.statusCode = 422
      throw err
    }

    const customerId = await getOrCreateStripeCustomer(userId, session.user.email)

    // Create authorization hold (not captured yet)
    const intent = await stripe.paymentIntents.create({
      amount: env.STRIPE_AUTH_HOLD_AMOUNT, // $25 auth hold
      currency: 'usd',
      customer: customerId,
      capture_method: 'manual', // Auth only, capture actual amount at session end
      metadata: { sessionId, userId, connectorId: session.connectorId },
      description: `EV Charging Session - Port #${session.connector.portNumber}`,
    })

    // Create payment record
    await db.payment.create({
      data: {
        userId,
        sessionId,
        stripePaymentIntentId: intent.id,
        stripeCustomerId: customerId,
        amount: env.STRIPE_AUTH_HOLD_AMOUNT / 100,
        status: 'PENDING',
      },
    })

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: env.STRIPE_AUTH_HOLD_AMOUNT,
      currency: 'usd',
    }
  },

  async confirmAndActivate(sessionId: string, paymentIntentId: string, userId: string) {
    const session = await db.chargingSession.findUnique({
      where: { id: sessionId },
      include: {
        connector: true,
        station: { select: { name: true } },
        payment: true,
      },
    })

    if (!session || session.userId !== userId) {
      const err = new Error('Session not found') as any
      err.statusCode = 404
      throw err
    }

    // Verify payment intent status with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (!['requires_capture', 'succeeded'].includes(intent.status)) {
      const err = new Error(`Payment not authorized (status: ${intent.status})`) as any
      err.statusCode = 422
      throw err
    }

    // Activate session and mark connector as OCCUPIED atomically
    const [updatedSession] = await db.$transaction([
      db.chargingSession.update({
        where: { id: sessionId },
        data: {
          status: 'STARTING',
          startedAt: new Date(),
        },
        include: {
          station: { select: { name: true } },
          connector: { select: { portNumber: true, connectorType: true, powerKw: true } },
          payment: { select: { id: true, sessionId: true, amount: true, currency: true, status: true } },
        },
      }),
      db.connector.update({
        where: { id: session.connectorId },
        data: { status: 'OCCUPIED' },
      }),
      db.payment.update({
        where: { stripePaymentIntentId: paymentIntentId },
        data: { status: 'AUTHORIZED' },
      }),
    ])

    // In production: send OCPP StartTransaction command to charger hardware
    // For now: simulate by transitioning to ACTIVE after 3 seconds
    setTimeout(async () => {
      await db.chargingSession.update({
        where: { id: sessionId },
        data: { status: 'ACTIVE' },
      })
      await redis.del(RedisKeys.sessionCache(sessionId))
    }, 3000)

    // Invalidate session cache
    await redis.del(RedisKeys.sessionCache(sessionId))

    return formatSession(updatedSession)
  },

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET)
    } catch {
      const err = new Error('Webhook signature verification failed') as any
      err.statusCode = 400
      throw err
    }

    switch (event.type) {
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent
        const sessionId = intent.metadata.sessionId
        if (sessionId) {
          await db.$transaction([
            db.payment.update({
              where: { stripePaymentIntentId: intent.id },
              data: { status: 'FAILED', failureReason: intent.last_payment_error?.message },
            }),
            db.chargingSession.update({
              where: { id: sessionId },
              data: { status: 'FAILED' },
            }),
          ])
          await redis.del(RedisKeys.sessionCache(sessionId))
        }
        break
      }
      case 'charge.captured': {
        const charge = event.data.object as Stripe.Charge
        if (charge.payment_intent) {
          await db.payment.update({
            where: { stripePaymentIntentId: charge.payment_intent as string },
            data: {
              status: 'CAPTURED',
              capturedAmount: charge.amount_captured / 100,
            },
          })
        }
        break
      }
    }
  },
}
