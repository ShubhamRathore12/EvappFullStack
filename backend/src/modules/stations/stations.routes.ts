import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { stationsService } from './stations.service'
import { authenticate } from '../../middleware/authenticate'

export async function stationsRoutes(app: FastifyInstance) {
  // Get nearby stations (protected)
  app.get('/nearby', { preHandler: [authenticate] }, async (req, reply) => {
    const query = z.object({
      lat: z.coerce.number().min(-90).max(90),
      lon: z.coerce.number().min(-180).max(180),
      radius: z.coerce.number().min(100).max(50000).default(5000),
      limit: z.coerce.number().min(1).max(50).default(20),
    }).parse(req.query)

    const stations = await stationsService.getNearby(query)
    return reply.send({ data: stations })
  })

  // Get single station
  app.get('/:id', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const station = await stationsService.getById(id)
    if (!station) {
      return reply.status(404).send({ message: 'Station not found' })
    }
    return reply.send(station)
  })
}
