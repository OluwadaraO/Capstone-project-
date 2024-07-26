/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `NotificationSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `NotificationSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotificationSubscription" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSubscription_userId_key" ON "NotificationSubscription"("userId");
