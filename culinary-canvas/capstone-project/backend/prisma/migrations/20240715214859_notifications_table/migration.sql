/*
  Warnings:

  - Added the required column `recipes` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "recipes" JSONB NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;
