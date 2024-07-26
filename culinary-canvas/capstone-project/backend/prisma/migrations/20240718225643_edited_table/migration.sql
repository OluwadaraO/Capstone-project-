/*
  Warnings:

  - You are about to drop the column `createdAt` on the `NotificationSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `keys` on the `NotificationSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `NotificationSubscription` table. All the data in the column will be lost.
  - Added the required column `auth` to the `NotificationSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `p256dh` to the `NotificationSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotificationSubscription" DROP COLUMN "createdAt",
DROP COLUMN "keys",
DROP COLUMN "updatedAt",
ADD COLUMN     "auth" TEXT NOT NULL,
ADD COLUMN     "p256dh" TEXT NOT NULL;
