import { buildApp } from './app'
import { env } from './config/env'
import { redis } from './config/redis'
import { db } from './config/database'

async function main() {
  const app = await buildApp()

  // Connect to Redis before listening
  await redis.connect()

  try {
    await app.listen({ port: env.PORT, host: env.HOST })
    app.log.info(`Server running at http://${env.HOST}:${env.PORT}`)
    if (env.NODE_ENV !== 'production') {
      app.log.info(`API docs at http://${env.HOST}:${env.PORT}/docs`)
    }
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
async function shutdown(signal: string) {
  console.info(`\nReceived ${signal}. Shutting down gracefully...`)
  await redis.quit()
  await db.$disconnect()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

main()
