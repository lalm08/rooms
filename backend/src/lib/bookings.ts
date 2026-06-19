import type { Prisma, PrismaClient } from '../generated/prisma/index.js'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export type BookingListQuery = {
  page?: number
  limit?: number
  search?: string
  status?: string
  auditoryId?: string
  organizer?: string
  date?: string
}

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed']

export function toBookingDto(
  booking: Prisma.BookingGetPayload<{ include: { auditory: true; device: true } }>,
) {
  const year = booking.createdAt.getFullYear()
  const seq = booking.id.slice(-4).toUpperCase()
  return {
    id: booking.id,
    displayId: `${year}-${seq}`,
    auditoryId: booking.auditoryId,
    deviceId: booking.deviceId,
    title: booking.title,
    organizer: booking.organizer,
    organizerEmail: booking.organizerEmail,
    note: booking.note,
    startAt: booking.startAt.toISOString(),
    endAt: booking.endAt.toISOString(),
    status: booking.status as BookingStatus,
    createdAt: booking.createdAt.toISOString(),
    auditory: {
      id: booking.auditory.id,
      code: booking.auditory.code,
      name: booking.auditory.name,
      capacity: booking.auditory.capacity,
      building: booking.auditory.building,
      floor: booking.auditory.floor,
      status: booking.auditory.status,
    },
    device: booking.device ? { id: booking.device.id, name: booking.device.name } : null,
  }
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function startOfWeek(d: Date) {
  const x = startOfDay(d)
  const day = x.getDay()
  const diff = day === 0 ? 6 : day - 1
  x.setDate(x.getDate() - diff)
  return x
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function buildBookingsWhere(query: BookingListQuery): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = {}

  if (query.status) where.status = query.status

  if (query.auditoryId) where.auditoryId = query.auditoryId

  if (query.organizer) {
    where.organizer = { equals: query.organizer, mode: 'insensitive' }
  }

  if (query.search) {
    const q = query.search.trim()
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { organizer: { contains: q, mode: 'insensitive' } },
      { organizerEmail: { contains: q, mode: 'insensitive' } },
      { auditory: { code: { contains: q, mode: 'insensitive' } } },
      { auditory: { name: { contains: q, mode: 'insensitive' } } },
    ]
  }

  const now = new Date()
  if (query.date === 'today') {
    where.startAt = { lte: endOfDay(now) }
    where.endAt = { gte: startOfDay(now) }
  } else if (query.date === 'week') {
    const weekEnd = new Date(startOfWeek(now))
    weekEnd.setDate(weekEnd.getDate() + 7)
    where.startAt = { lt: weekEnd }
    where.endAt = { gte: startOfWeek(now) }
  } else if (query.date === 'month') {
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    where.startAt = { lt: monthEnd }
    where.endAt = { gte: startOfMonth(now) }
  }

  return where
}

export async function syncAuditoryStatus(prisma: PrismaClient, auditoryId: string) {
  const room = await prisma.auditory.findUnique({ where: { id: auditoryId } })
  if (!room || room.status === 'maintenance') return

  const now = new Date()
  const active = await prisma.booking.count({
    where: {
      auditoryId,
      status: { in: ACTIVE_STATUSES },
      endAt: { gt: now },
    },
  })

  await prisma.auditory.update({
    where: { id: auditoryId },
    data: { status: active > 0 ? 'booked' : 'available' },
  })
}

export async function getBookingsStats(prisma: PrismaClient) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [total, activeToday, pending, cancelledThisWeek, monthBookings] = await Promise.all([
    prisma.booking.count({ where: { status: { not: 'cancelled' } } }),
    prisma.booking.count({
      where: {
        status: { in: ACTIVE_STATUSES },
        startAt: { lte: todayEnd },
        endAt: { gte: todayStart },
      },
    }),
    prisma.booking.count({ where: { status: 'pending' } }),
    prisma.booking.count({
      where: {
        status: 'cancelled',
        updatedAt: { gte: weekStart },
      },
    }),
    prisma.booking.findMany({
      where: {
        status: 'confirmed',
        startAt: { gte: monthStart, lt: monthEnd },
      },
      select: { startAt: true, endAt: true },
    }),
  ])

  const hoursThisMonth = monthBookings.reduce((sum, b) => {
    const ms = b.endAt.getTime() - b.startAt.getTime()
    return sum + Math.max(0, ms / (1000 * 60 * 60))
  }, 0)

  const roomCount = await prisma.auditory.count()
  const maxHours = roomCount * 12 * 30
  const usagePercent = maxHours > 0 ? Math.min(100, Math.round((hoursThisMonth / maxHours) * 100)) : 0

  return {
    total,
    activeToday,
    pending,
    cancelledThisWeek,
    hoursThisMonth: Math.round(hoursThisMonth),
    usagePercent,
  }
}

export type OccupancyCell = 'free' | 'occupied' | 'preparation' | 'unavailable'

export async function getOccupancyGrid(prisma: PrismaClient, dateStr?: string) {
  const base = dateStr ? new Date(dateStr) : new Date()
  const dayStart = startOfDay(base)
  const dayEnd = endOfDay(base)
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i)

  const auditories = await prisma.auditory.findMany({
    orderBy: [{ floor: 'asc' }, { code: 'asc' }],
    take: 8,
  })

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ACTIVE_STATUSES },
      startAt: { lte: dayEnd },
      endAt: { gte: dayStart },
      auditoryId: { in: auditories.map((a) => a.id) },
    },
  })

  const rows = auditories.map((room) => {
    const cells: OccupancyCell[] = hours.map((hour) => {
      if (room.status === 'maintenance') return 'unavailable'

      const slotStart = new Date(dayStart)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(dayStart)
      slotEnd.setHours(hour + 1, 0, 0, 0)

      const overlapping = bookings.filter(
        (b) =>
          b.auditoryId === room.id &&
          b.startAt < slotEnd &&
          b.endAt > slotStart,
      )

      if (overlapping.length === 0) return 'free'

      const prep = overlapping.some((b) => {
        const prepStart = new Date(b.startAt.getTime() - 30 * 60 * 1000)
        return slotStart >= prepStart && slotStart < b.startAt
      })
      if (prep) return 'preparation'

      return 'occupied'
    })

    return {
      auditoryId: room.id,
      code: room.code,
      name: room.name,
      cells,
    }
  })

  return { date: dayStart.toISOString().slice(0, 10), hours, rows }
}

export async function getUpcomingBookings(prisma: PrismaClient, limit = 3) {
  const now = new Date()
  const items = await prisma.booking.findMany({
    where: {
      status: { in: ACTIVE_STATUSES },
      startAt: { gte: now },
    },
    include: { auditory: true, device: true },
    orderBy: { startAt: 'asc' },
    take: limit,
  })
  return items.map(toBookingDto)
}

export async function getBookingOrganizers(prisma: PrismaClient) {
  const rows = await prisma.booking.findMany({
    where: { organizer: { not: '' } },
    distinct: ['organizer'],
    select: { organizer: true },
    orderBy: { organizer: 'asc' },
  })
  return rows.map((r) => r.organizer)
}
