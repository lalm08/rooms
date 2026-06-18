import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import prismaPlugin from './plugins/prisma.js'
import {
  buildRoomsWhere,
  getBuildingSchema,
  getEquipmentOverview,
  getRecentActivity,
  getRoomsStats,
  toRoomDto,
} from './lib/rooms.js'
import { seedDatabase } from './seed.js'

const CORS_ORIGINS = [
  'https://lalm08.github.io',
  'http://localhost',
  'http://localhost:80',
  'http://localhost:5173',
  'http://127.0.0.1',
  'http://127.0.0.1:80',
  'http://127.0.0.1:5173',
]

export async function buildApp() {
  const app = Fastify({ logger: true })

  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: CORS_ORIGINS,
    methods: ['*'],
    allowedHeaders: ['*'],
  })
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })
  await app.register(prismaPlugin)

  app.get('/health', async () => ({ ok: true }))
  app.get('/', async () => ({ service: 'rooms-api', ok: true }))

  try {
    await seedDatabase(app.prisma)
  } catch (err) {
    app.log.error(err, 'Seed skipped due to error')
  }

  // --- Rooms catalog ---
  app.get('/api/rooms', async (req) => {
    const q = req.query as Record<string, string | undefined>
    const page = Math.max(1, Number(q.page ?? 1))
    const limit = Math.min(100, Math.max(1, Number(q.limit ?? 10)))
    const where = buildRoomsWhere({
      page,
      limit,
      search: q.search,
      building: q.building,
      floor: q.floor ? Number(q.floor) : undefined,
      status: q.status,
      equipment: q.equipment,
    })

    const [total, items] = await Promise.all([
      app.prisma.auditory.count({ where }),
      app.prisma.auditory.findMany({
        where,
        orderBy: [{ floor: 'asc' }, { code: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return {
      items: items.map(toRoomDto),
      page,
      limit,
      total,
    }
  })

  app.get('/api/rooms/stats', async () => getRoomsStats(app.prisma))

  app.get('/api/rooms/buildings', async () => {
    const rows = await app.prisma.auditory.findMany({
      distinct: ['building'],
      select: { building: true },
      orderBy: { building: 'asc' },
    })
    return rows.map((r) => r.building)
  })

  app.get('/api/rooms/schema', async (req) => {
    const { building } = req.query as { building?: string }
    return getBuildingSchema(app.prisma, building)
  })

  app.get('/api/equipment/overview', async () => getEquipmentOverview(app.prisma))

  app.get('/api/activity/recent', async () => getRecentActivity(app.prisma))

  // --- Devices ---
  app.get('/api/devices', async () => app.prisma.device.findMany())
  app.post('/api/devices', async (req, reply) => {
    const { name } = req.body as { name: string }
    const device = await app.prisma.device.create({ data: { name } })
    reply.code(201)
    return device
  })
  app.put('/api/devices/:id', async (req) => {
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
  app.get('/api/auditories', async (req, reply) => {
    try {
      return await app.prisma.auditory.findMany({ orderBy: { code: 'asc' } })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('!!! ОШИБКА БАЗЫ ДАННЫХ !!!:', message)
      reply.status(500).send({ error: message })
    }
  })

  app.post('/api/auditories', async (req, reply) => {
    const body = req.body as {
      name: string
      code?: string
      capacity?: number
      status?: string
      building?: string
      floor?: number
      equipment?: string[]
      description?: string
    }
    const code = body.code?.trim() || body.name.trim().replace(/\s+/g, '-').slice(0, 32)
    const aud = await app.prisma.auditory.create({
      data: {
        code,
        name: body.name,
        description: body.description,
        capacity: body.capacity ? Number(body.capacity) : 0,
        status: body.status || 'available',
        building: body.building || 'Главный корпус',
        floor: body.floor ? Number(body.floor) : 1,
        equipment: body.equipment ?? [],
      },
    })
    reply.code(201)
    return aud
  })

  app.put('/api/auditories/:id', async (req) => {
    const { id } = req.params as { id: string }
    const body = req.body as {
      name?: string
      code?: string
      capacity?: number
      status?: string
      building?: string
      floor?: number
      equipment?: string[]
      description?: string
    }
    return app.prisma.auditory.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.code !== undefined && { code: body.code }),
        ...(body.capacity !== undefined && { capacity: Number(body.capacity) }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.building !== undefined && { building: body.building }),
        ...(body.floor !== undefined && { floor: Number(body.floor) }),
        ...(body.equipment !== undefined && { equipment: body.equipment }),
        ...(body.description !== undefined && { description: body.description }),
      },
    })
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
    await app.prisma.auditory.update({
      where: { id: auditoryId },
      data: { status: 'booked' },
    })
    reply.code(201)
    return booking
  })
  app.put('/api/bookings/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { deviceId, auditoryId } = req.body as { deviceId: string; auditoryId: string }
    try {
      return await app.prisma.booking.update({
        where: { id },
        data: { deviceId, auditoryId },
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      reply.status(500).send({ error: message })
    }
  })
  app.delete('/api/bookings/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const booking = await app.prisma.booking.findUnique({ where: { id } })
    await app.prisma.booking.delete({ where: { id } })
    if (booking) {
      const other = await app.prisma.booking.count({ where: { auditoryId: booking.auditoryId } })
      if (other === 0) {
        await app.prisma.auditory.update({
          where: { id: booking.auditoryId },
          data: { status: 'available' },
        })
      }
    }
    reply.code(204).send()
  })

  return app
}
