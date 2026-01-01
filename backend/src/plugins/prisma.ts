import fp from 'fastify-plugin'
import { PrismaClient } from '../generated/prisma/index.js'

// Расширяем типизацию Fastify: после регистрации плагина у экземпляра появится свойство prisma.
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

// Fastify-плагин, который создаёт один экземпляр PrismaClient и подключает его ко всему приложению.
export default fp(async (app) => {
  // Передаем URL базы данных прямо в конструктор, 
  // так как Prisma 7 больше не берет его из schema.prisma автоматически
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL!,
      },
    },
  })

  // decorate делает prisma доступным как app.prisma во всех маршрутах и хукax.
  app.decorate('prisma', prisma)

  // Хук onClose вызывает $disconnect, когда сервер останавливается, чтобы закрыть соединение с БД.
  app.addHook('onClose', async (inst) => {
    await inst.prisma.$disconnect()
  })
})