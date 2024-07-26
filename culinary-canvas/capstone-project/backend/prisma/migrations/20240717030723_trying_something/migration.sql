/*
  Warnings:

  - Changed the type of `recipes` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "recipes",
ADD COLUMN     "recipes" JSONB NOT NULL;
