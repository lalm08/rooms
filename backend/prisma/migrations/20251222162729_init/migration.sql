/*
  Warnings:

  - You are about to drop the column `datetime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomAndDevice` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_auditory` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_device` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropForeignKey
ALTER TABLE "RoomAndDevice" DROP CONSTRAINT "RoomAndDevice_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "RoomAndDevice" DROP CONSTRAINT "RoomAndDevice_roomId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "datetime",
DROP COLUMN "roomId",
DROP COLUMN "userId",
ADD COLUMN     "id_auditory" TEXT NOT NULL,
ADD COLUMN     "id_device" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "Room";

-- DropTable
DROP TABLE "RoomAndDevice";

-- CreateTable
CREATE TABLE "Auditory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Auditory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
