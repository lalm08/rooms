import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // В Prisma 7 env используется как функция: env("ИМЯ_ПЕРЕМЕННОЙ")
    url: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/db",
  },
})