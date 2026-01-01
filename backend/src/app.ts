import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import prismaPlugin from './plugins/prisma.js'
import type { Device, Auditory, Booking } from './types.js'

export async function buildApp() {
  const app = Fastify({ logger: true })

  // --- Инфраструктура ---
  await app.register(helmet)
  await app.register(cors, { origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization']  
   })
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })
  await app.register(prismaPlugin)

  // --- Devices ---
  app.get('/api/devices', async () => app.prisma.device.findMany())
  app.post('/api/devices', async (req, reply) => {
    const { name } = req.body as { name: string }
    const device = await app.prisma.device.create({ data: { name } })
    reply.code(201)
    return device
  })
  app.put('/api/devices/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { name } = req.body as { name: string }
    return app.prisma.device.update({ where: { id }, data: { name } })
  })
  app.delete('/api/devices/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await app.prisma.device.delete({ where: { id } })
    reply.code(204).send()
  })

  // --- Auditories ---
  //app.get('/api/auditories', async () => app.prisma.auditory.findMany())
 app.get('/api/auditories', async (req, reply) => {
  try {
    const data = await app.prisma.auditory.findMany()
    return data
  } catch (error: any) {
    // ВАЖНО: Это выведет реальную причину в черный терминал бэкенда
    console.error('!!! ОШИБКА БАЗЫ ДАННЫХ !!!:', error.message) 
    reply.status(500).send({ error: error.message })
  }
})
  app.post('/api/auditories', async (req, reply) => {
  const { name, capacity, status } = req.body as { name: string; capacity?: number; status?: string }
  const aud = await app.prisma.auditory.create({ 
    data: { 
      name, 
      capacity: capacity ? Number(capacity) : 0,
      status: status || 'available' 
    } 
  })
  reply.code(201)
  return aud
})
  app.put('/api/auditories/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { name, capacity, status } = req.body as { name: string; capacity?: number; status?: string }
    return app.prisma.auditory.update({ where: { id }, data: { name, capacity: capacity ? Number(capacity) : 0, status: status || 'available'  } })
  })
  app.delete('/api/auditories/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await app.prisma.auditory.delete({ where: { id } })
    reply.code(204).send()
  })

  // --- Bookings ---
  app.get('/api/bookings', async () =>
    app.prisma.booking.findMany({ include: { device: true, auditory: true } })
  )
  app.post('/api/bookings', async (req, reply) => {
    const { deviceId, auditoryId } = req.body as { deviceId: string; auditoryId: string }
    const booking = await app.prisma.booking.create({ data: { deviceId, auditoryId } })
    reply.code(201)
    return booking
  })
 app.put('/api/bookings/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { deviceId, auditoryId } = req.body as { deviceId: string; auditoryId: string }
    try {
      const updated = await app.prisma.booking.update({
        where: { id },
        data: { deviceId, auditoryId }
      })
      return updated
    } catch (error: any) {
      reply.status(500).send({ error: error.message })
    }
  })
  app.delete('/api/bookings/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await app.prisma.booking.delete({ where: { id } })
    reply.code(204).send()
  })

  return app
}
