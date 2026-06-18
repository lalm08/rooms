import type { Prisma, PrismaClient } from '../generated/prisma/index.js'

export type RoomStatus = 'available' | 'booked' | 'maintenance'

export interface RoomDto {
  id: string
  code: string
  name: string
  description?: string | null
  capacity: number
  building: string
  floor: number
  equipment: string[]
  status: RoomStatus
}

export interface RoomsQuery {
  page?: number
  limit?: number
  search?: string
  building?: string
  floor?: number
  status?: string
  equipment?: string
}

const VALID_STATUS = new Set<RoomStatus>(['available', 'booked', 'maintenance'])

export function toRoomDto(a: {
  id: string
  code: string
  name: string
  description: string | null
  capacity: number
  building: string
  floor: number
  equipment: string[]
  status: string
}): RoomDto {
  const status = VALID_STATUS.has(a.status as RoomStatus)
    ? (a.status as RoomStatus)
    : 'available'

  return {
    id: a.id,
    code: a.code,
    name: a.name,
    description: a.description,
    capacity: a.capacity,
    building: a.building,
    floor: a.floor,
    equipment: a.equipment,
    status,
  }
}

export function buildRoomsWhere(query: RoomsQuery): Prisma.AuditoryWhereInput {
  const where: Prisma.AuditoryWhereInput = {}

  if (query.search?.trim()) {
    const q = query.search.trim()
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (query.building) {
    where.building = query.building
  }

  if (query.floor) {
    where.floor = query.floor
  }

  if (query.status) {
    where.status = query.status
  }

  if (query.equipment) {
    const tags = query.equipment.split(',').map((t) => t.trim()).filter(Boolean)
    if (tags.length === 1) {
      where.equipment = { has: tags[0] }
    } else if (tags.length > 1) {
      where.AND = tags.map((tag) => ({ equipment: { has: tag } }))
    }
  }

  return where
}

export async function getRoomsStats(prisma: PrismaClient) {
  const [total, available, booked, rooms] = await Promise.all([
    prisma.auditory.count(),
    prisma.auditory.count({ where: { status: 'available' } }),
    prisma.auditory.count({ where: { status: 'booked' } }),
    prisma.auditory.findMany({ select: { equipment: true } }),
  ])

  const equipmentUnits = rooms.reduce((sum, r) => sum + r.equipment.length, 0)

  return { total, available, booked, equipmentUnits }
}

const EQUIPMENT_LABELS: Record<string, string> = {
  projector: 'Проекторы',
  computers: 'Компьютеры',
  board: 'Интеракт. доски',
  microphone: 'Микрофоны',
  camera: 'Камеры',
  ac: 'Кондиционеры',
}

export async function getEquipmentOverview(prisma: PrismaClient) {
  const rooms = await prisma.auditory.findMany({ select: { equipment: true } })
  const counts: Record<string, number> = {}

  for (const room of rooms) {
    for (const key of room.equipment) {
      counts[key] = (counts[key] ?? 0) + 1
    }
  }

  const order = ['projector', 'computers', 'board', 'microphone', 'camera', 'ac']

  return order
    .filter((key) => counts[key])
    .map((key) => ({
      key,
      label: EQUIPMENT_LABELS[key] ?? key,
      count: counts[key],
    }))
}

export async function getBuildingSchema(prisma: PrismaClient, building = 'Главный корпус') {
  const rooms = await prisma.auditory.findMany({
    where: { building },
    orderBy: [{ floor: 'desc' }, { code: 'asc' }],
    select: { code: true, floor: true, status: true },
  })

  const floorMap = new Map<number, Array<{ code: string; status: RoomStatus }>>()

  for (const room of rooms) {
    const status = VALID_STATUS.has(room.status as RoomStatus)
      ? (room.status as RoomStatus)
      : 'available'
    const list = floorMap.get(room.floor) ?? []
    list.push({ code: room.code, status })
    floorMap.set(room.floor, list)
  }

  const floors = [...floorMap.entries()]
    .sort(([a], [b]) => b - a)
    .map(([floor, floorRooms]) => ({
      floor,
      rooms: floorRooms,
      available: floorRooms.filter((r) => r.status === 'available').length,
      total: floorRooms.length,
    }))

  return { building, floors }
}

export async function getRecentActivity(prisma: PrismaClient) {
  const [rooms, bookings] = await Promise.all([
    prisma.auditory.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { code: true, name: true, updatedAt: true, createdAt: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { auditory: { select: { code: true } }, device: { select: { name: true } } },
    }),
  ])

  const events: Array<{ type: string; text: string; at: Date }> = []

  for (const room of rooms) {
    const isNew = room.createdAt.getTime() === room.updatedAt.getTime()
    events.push({
      type: isNew ? 'add' : 'edit',
      text: isNew
        ? `Добавлена аудитория ${room.code}`
        : `Обновлена аудитория ${room.code}`,
      at: room.updatedAt,
    })
  }

  for (const booking of bookings) {
    events.push({
      type: 'booking',
      text: `Создано бронирование для аудитории ${booking.auditory.code}`,
      at: booking.createdAt,
    })
  }

  return events
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 5)
    .map((e) => ({
      type: e.type,
      text: e.text,
      at: e.at.toISOString(),
    }))
}
