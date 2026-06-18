import type { PrismaClient } from './generated/prisma/index.js'

const MAIN_BUILDING = 'Главный корпус'

const ROOMS: Array<{
  code: string
  name: string
  description?: string
  capacity: number
  status: string
  floor: number
  equipment: string[]
}> = [
  { code: '101', name: 'Лекционная аудитория', capacity: 120, status: 'available', floor: 1, equipment: ['projector', 'wifi'] },
  { code: '102', name: 'Компьютерный класс', capacity: 30, status: 'booked', floor: 1, equipment: ['computers', 'projector', 'board', 'wifi'] },
  { code: '103', name: 'Семинарская', capacity: 25, status: 'available', floor: 1, equipment: ['board', 'wifi'] },
  { code: '104', name: 'Малый зал', capacity: 40, status: 'available', floor: 1, equipment: ['projector', 'microphone', 'wifi'] },
  { code: '201', name: 'Конференц-зал', capacity: 50, status: 'available', floor: 2, equipment: ['projector', 'microphone', 'wifi'] },
  { code: '202', name: 'Лаборатория', capacity: 20, status: 'booked', floor: 2, equipment: ['computers', 'board', 'wifi'] },
  { code: '203', name: 'Аудитория 203', capacity: 35, status: 'available', floor: 2, equipment: ['projector', 'wifi'] },
  { code: '204', name: 'Аудитория 204', capacity: 28, status: 'maintenance', floor: 2, equipment: ['board', 'wifi'] },
  { code: '301', name: 'Аудитория 301', capacity: 45, status: 'available', floor: 3, equipment: ['projector', 'board', 'wifi'] },
  { code: '302', name: 'Аудитория 302', capacity: 32, status: 'available', floor: 3, equipment: ['computers', 'wifi'] },
  { code: '303', name: 'Аудитория 303', capacity: 60, status: 'available', floor: 3, equipment: ['projector', 'microphone', 'wifi'] },
  { code: '304', name: 'Аудитория 304', capacity: 22, status: 'booked', floor: 3, equipment: ['board', 'wifi'] },
  { code: '401', name: 'Аудитория 401', capacity: 38, status: 'available', floor: 4, equipment: ['projector', 'wifi'] },
  { code: '402', name: 'Аудитория 402', capacity: 26, status: 'booked', floor: 4, equipment: ['computers', 'projector', 'wifi'] },
  { code: '403', name: 'Аудитория 403', capacity: 30, status: 'available', floor: 4, equipment: ['board', 'microphone', 'wifi'] },
  { code: '404', name: 'Аудитория 404', capacity: 18, status: 'available', floor: 4, equipment: ['wifi'] },
]

export async function seedDatabase(prisma: PrismaClient) {
  const existing = await prisma.auditory.findMany()
  if (existing.length > 0) {
    for (const room of existing) {
      if (!room.code) {
        await prisma.auditory.update({
          where: { id: room.id },
          data: { code: room.name.replace(/\s+/g, '-').slice(0, 32) || room.id },
        })
      }
    }
    return
  }

  for (const room of ROOMS) {
    await prisma.auditory.create({
      data: {
        code: room.code,
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        status: room.status,
        building: MAIN_BUILDING,
        floor: room.floor,
        equipment: room.equipment,
      },
    })
  }

  const devices = ['Проектор Epson', 'Ноутбук Dell', 'Микрофон Shure', 'Интерактивная доска']
  for (const name of devices) {
    await prisma.device.create({ data: { name } })
  }
}
