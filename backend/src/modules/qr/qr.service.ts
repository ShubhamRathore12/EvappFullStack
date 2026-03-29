import { createHmac, timingSafeEqual } from 'crypto'
import { randomBytes } from 'crypto'
import { db } from '../../config/database'
import { redis, RedisKeys } from '../../config/redis'
import { env } from '../../config/env'

interface QRPayload {
  v: number
  cid: string
  sid: string
  pn: number
  ts: number
  sig: string
}

function verifySignature(payload: QRPayload): boolean {
  const canonical = `${payload.v}:${payload.cid}:${payload.sid}:${payload.pn}:${payload.ts}`
  const expectedSig = createHmac('sha256', env.QR_HMAC_SECRET).update(canonical).digest('hex')
  const expected = Buffer.from(expectedSig, 'hex')
  const received = Buffer.from(payload.sig, 'hex')
  if (expected.length !== received.length) return false
  return timingSafeEqual(expected, received)
}

export const qrService = {
  async validate(rawPayload: string) {
    let payload: QRPayload
    try {
      const decoded = Buffer.from(rawPayload, 'base64url').toString('utf8')
      payload = JSON.parse(decoded)
    } catch {
      const err = new Error('Invalid QR code format') as any
      err.statusCode = 400
      throw err
    }

    if (!payload.v || !payload.cid || !payload.sid || !payload.sig) {
      const err = new Error('Malformed QR code') as any
      err.statusCode = 400
      throw err
    }

    if (!verifySignature(payload)) {
      const err = new Error('QR code signature invalid') as any
      err.statusCode = 400
      throw err
    }

    // Check cache first
    const cacheKey = RedisKeys.qrCache(payload.cid)
    const cached = await redis.get(cacheKey)
    if (cached) {
      const result = JSON.parse(cached)
      // Generate fresh session token even from cache
      result.sessionToken = randomBytes(32).toString('hex')
      return result
    }

    // Fetch connector + station
    const connector = await db.connector.findUnique({
      where: { id: payload.cid },
      include: {
        station: {
          select: {
            id: true, name: true, addressLine1: true, city: true, state: true,
          },
        },
      },
    })

    if (!connector || connector.stationId !== payload.sid) {
      const err = new Error('Charging port not found') as any
      err.statusCode = 404
      throw err
    }

    if (connector.status === 'FAULTED' || connector.status === 'OFFLINE') {
      const err = new Error(`Port is ${connector.status.toLowerCase()} and unavailable`) as any
      err.statusCode = 422
      throw err
    }

    const result = {
      connectorId: connector.id,
      stationId: connector.stationId,
      portNumber: connector.portNumber,
      connectorType: connector.connectorType,
      powerKw: Number(connector.powerKw),
      pricing: {
        perKwh: Number(connector.pricePerKwh),
        perMinute: connector.pricePerMinute ? Number(connector.pricePerMinute) : undefined,
        sessionFee: Number(connector.sessionFee),
      },
      stationName: connector.station.name,
      address: `${connector.station.addressLine1}, ${connector.station.city}, ${connector.station.state}`,
      status: connector.status,
    }

    // Cache for 30 seconds (status may change)
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 30)

    return {
      ...result,
      sessionToken: randomBytes(32).toString('hex'),
    }
  },

  generatePayload(connectorId: string, stationId: string, portNumber: number): string {
    const ts = Math.floor(Date.now() / 1000)
    const canonical = `1:${connectorId}:${stationId}:${portNumber}:${ts}`
    const sig = createHmac('sha256', env.QR_HMAC_SECRET).update(canonical).digest('hex')
    const obj: QRPayload = { v: 1, cid: connectorId, sid: stationId, pn: portNumber, ts, sig }
    return Buffer.from(JSON.stringify(obj)).toString('base64url')
  },
}
