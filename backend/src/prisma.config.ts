import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // В Prisma 7 env используется как функция: env("ИМЯ_ПЕРЕМЕННОЙ")
    url: env("DATABASE_URL"),
  },
})