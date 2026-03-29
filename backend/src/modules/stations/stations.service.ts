import { db } from '../../config/database'
import { redis, RedisKeys } from '../../config/redis'

// Simple geohash for caching nearby results
function simpleGeohash(lat: number, lon: number, precision = 4): string {
  const latP = Math.floor(lat * precision)
  const lonP = Math.floor(lon * precision)
  return `${latP}_${lonP}`
}

export const stationsService = {
  async getNearby({
    lat,
    lon,
    radius,
    limit,
  }: {
    lat: number
    lon: number
    radius: number
    limit: number
  }) {
    const cacheKey = RedisKeys.nearbyStations(simpleGeohash(lat, lon))
    const cached = await redis.get(cacheKey)
    if (cached) {
      const all = JSON.parse(cached)
      return all.slice(0, limit)
    }

    // Haversine distance query using raw SQL (works without PostGIS)
    // For production with PostGIS: use ST_DWithin with geography type
    const stations = await db.$queryRaw<any[]>`
      SELECT
        s.id, s.name, s.address_line_1, s.address_line_2, s.city, s.state,
        s.postal_code, s.country, s.latitude::float, s.longitude::float,
        s.operator_name, s.operator_logo_url, s.amenities,
        s.total_ports, s.available_ports, s.rating::float, s.rating_count,
        (
          6371000 * acos(
            cos(radians(${lat})) * cos(radians(s.latitude::float)) *
            cos(radians(s.longitude::float) - radians(${lon})) +
            sin(radians(${lat})) * sin(radians(s.latitude::float))
          )
        ) AS distance
      FROM charging_stations s
      WHERE s.is_active = true
        AND (
          6371000 * acos(
            cos(radians(${lat})) * cos(radians(s.latitude::float)) *
            cos(radians(s.longitude::float) - radians(${lon})) +
            sin(radians(${lat})) * sin(radians(s.latitude::float))
          )
        ) <= ${radius}
      ORDER BY distance ASC
      LIMIT 50
    `

    // Fetch connectors for all stations in one query
    const stationIds = stations.map((s: any) => s.id)
    const connectors =
      stationIds.length > 0
        ? await db.connector.findMany({
            where: { stationId: { in: stationIds } },
            select: {
              id: true, stationId: true, portNumber: true, connectorType: true,
              powerKw: true, currentType: true, status: true, pricePerKwh: true,
              pricePerMinute: true, sessionFee: true,
            },
          })
        : []

    const connectorsByStation: Record<string, typeof connectors> = {}
    for (const c of connectors) {
      if (!connectorsByStation[c.stationId]) connectorsByStation[c.stationId] = []
      connectorsByStation[c.stationId].push(c)
    }

    const result = stations.map((s: any) => ({
      id: s.id,
      name: s.name,
      addressLine1: s.address_line_1,
      addressLine2: s.address_line_2,
      city: s.city,
      state: s.state,
      postalCode: s.postal_code,
      country: s.country,
      latitude: s.latitude,
      longitude: s.longitude,
      operatorName: s.operator_name,
      operatorLogoUrl: s.operator_logo_url,
      amenities: s.amenities,
      totalPorts: s.total_ports,
      availablePorts: s.available_ports,
      rating: s.rating,
      ratingCount: s.rating_count,
      distance: Math.round(s.distance),
      connectors: (connectorsByStation[s.id] ?? []).map((c) => ({
        id: c.id,
        portNumber: c.portNumber,
        connectorType: c.connectorType,
        powerKw: Number(c.powerKw),
        currentType: c.currentType,
        status: c.status,
        pricePerKwh: Number(c.pricePerKwh),
        pricePerMinute: c.pricePerMinute ? Number(c.pricePerMinute) : undefined,
        sessionFee: Number(c.sessionFee),
      })),
    }))

    // Cache for 60 seconds
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60)

    return result.slice(0, limit)
  },

  async getById(id: string) {
    const station = await db.chargingStation.findUnique({
      where: { id, isActive: true },
      include: {
        connectors: {
          select: {
            id: true, portNumber: true, connectorType: true, powerKw: true,
            currentType: true, status: true, pricePerKwh: true,
            pricePerMinute: true, sessionFee: true,
          },
        },
      },
    })
    if (!station) return null

    return {
      id: station.id,
      name: station.name,
      addressLine1: station.addressLine1,
      addressLine2: station.addressLine2,
      city: station.city,
      state: station.state,
      latitude: Number(station.latitude),
      longitude: Number(station.longitude),
      operatorName: station.operatorName,
      amenities: station.amenities,
      totalPorts: station.totalPorts,
      availablePorts: station.availablePorts,
      rating: station.rating ? Number(station.rating) : undefined,
      ratingCount: station.ratingCount,
      connectors: station.connectors.map((c) => ({
        id: c.id,
        portNumber: c.portNumber,
        connectorType: c.connectorType,
        powerKw: Number(c.powerKw),
        currentType: c.currentType,
        status: c.status,
        pricePerKwh: Number(c.pricePerKwh),
        pricePerMinute: c.pricePerMinute ? Number(c.pricePerMinute) : undefined,
        sessionFee: Number(c.sessionFee),
      })),
    }
  },
}
