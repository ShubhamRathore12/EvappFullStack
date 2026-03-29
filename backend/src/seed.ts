/**
 * Database seed: creates sample EV charging stations and connectors
 * Run with: npm run db:seed
 */
import { PrismaClient } from '@prisma/client'
import { qrService } from './modules/qr/qr.service'

const db = new PrismaClient()

const SAMPLE_STATIONS = [
  {
    name: 'Downtown Fast Charge Hub',
    addressLine1: '100 Main Street',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    latitude: 37.7749,
    longitude: -122.4194,
    operatorName: 'EV Charge Network',
    amenities: ['wifi', 'restroom', 'coffee'],
    connectors: [
      { portNumber: 1, connectorType: 'CCS1' as const, powerKw: 150, currentType: 'DC' as const, pricePerKwh: 0.35 },
      { portNumber: 2, connectorType: 'CCS2' as const, powerKw: 150, currentType: 'DC' as const, pricePerKwh: 0.35 },
      { portNumber: 3, connectorType: 'TYPE2' as const, powerKw: 22, currentType: 'AC' as const, pricePerKwh: 0.28 },
      { portNumber: 4, connectorType: 'J1772' as const, powerKw: 7.2, currentType: 'AC' as const, pricePerKwh: 0.25 },
    ],
  },
  {
    name: 'Marina Green Charging',
    addressLine1: '2 Marina Blvd',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94123',
    latitude: 37.8077,
    longitude: -122.4394,
    operatorName: 'GreenCharge',
    amenities: ['wifi', 'park'],
    connectors: [
      { portNumber: 1, connectorType: 'TESLA_NACS' as const, powerKw: 250, currentType: 'DC' as const, pricePerKwh: 0.40 },
      { portNumber: 2, connectorType: 'CHADEMO' as const, powerKw: 50, currentType: 'DC' as const, pricePerKwh: 0.32 },
    ],
  },
  {
    name: 'Mission Street EV Stop',
    addressLine1: '2450 Mission St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94110',
    latitude: 37.7572,
    longitude: -122.4195,
    operatorName: 'CityCharge',
    amenities: ['restroom'],
    connectors: [
      { portNumber: 1, connectorType: 'CCS1' as const, powerKw: 50, currentType: 'DC' as const, pricePerKwh: 0.30, sessionFee: 1.00 },
      { portNumber: 2, connectorType: 'TYPE2' as const, powerKw: 11, currentType: 'AC' as const, pricePerKwh: 0.22 },
      { portNumber: 3, connectorType: 'J1772' as const, powerKw: 7.2, currentType: 'AC' as const, pricePerKwh: 0.22 },
    ],
  },
]

async function seed() {
  console.log('Seeding database...')

  for (const stationData of SAMPLE_STATIONS) {
    const { connectors: connectorData, ...rest } = stationData

    const station = await db.chargingStation.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        ...rest,
        totalPorts: connectorData.length,
        availablePorts: connectorData.length,
        rating: 4.5,
        ratingCount: 128,
      },
    })

    console.log(`Created station: ${station.name} (${station.id})`)

    for (const c of connectorData) {
      const connector = await db.connector.create({
        data: {
          stationId: station.id,
          portNumber: c.portNumber,
          connectorType: c.connectorType,
          powerKw: c.powerKw,
          currentType: c.currentType,
          pricePerKwh: c.pricePerKwh,
          sessionFee: (c as any).sessionFee ?? 0,
          qrCodeData: 'placeholder',
        },
      })

      // Generate and store QR payload
      const qrPayload = qrService.generatePayload(connector.id, station.id, c.portNumber)
      await db.connector.update({
        where: { id: connector.id },
        data: { qrCodeData: qrPayload },
      })

      console.log(`  Port ${c.portNumber} (${c.connectorType}): ${qrPayload.substring(0, 30)}...`)
    }
  }

  console.log('Seed complete!')
  await db.$disconnect()
}

seed().catch((e) => {
  console.error(e)
  db.$disconnect()
  process.exit(1)
})
