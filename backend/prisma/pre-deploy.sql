-- Безопасное обновление существующей БД перед prisma db push
-- (когда в Auditory уже есть строки без новых колонок)

ALTER TABLE "Auditory" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "Auditory" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Auditory" ADD COLUMN IF NOT EXISTS "building" TEXT DEFAULT 'Главный корпус';
ALTER TABLE "Auditory" ADD COLUMN IF NOT EXISTS "floor" INTEGER DEFAULT 1;
ALTER TABLE "Auditory" ADD COLUMN IF NOT EXISTS "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Auditory" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Auditory" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

UPDATE "Auditory" SET "code" = "id" WHERE "code" IS NULL OR "code" = '';
UPDATE "Auditory" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
UPDATE "Auditory" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
UPDATE "Auditory" SET "building" = 'Главный корпус' WHERE "building" IS NULL;
UPDATE "Auditory" SET "floor" = 1 WHERE "floor" IS NULL;
UPDATE "Auditory" SET "equipment" = ARRAY[]::TEXT[] WHERE "equipment" IS NULL;
UPDATE "Auditory" SET "capacity" = 0 WHERE "capacity" IS NULL;
UPDATE "Auditory" SET "status" = 'available' WHERE "status" IS NULL;

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
