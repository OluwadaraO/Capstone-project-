/*
  Warnings:

  - You are about to drop the column `isVerified` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "isVerified",
DROP COLUMN "verificationToken";
