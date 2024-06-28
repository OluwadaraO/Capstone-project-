/*
  Warnings:

  - You are about to drop the column `userID` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_userID_fkey";

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "userID";

-- DropTable
DROP TABLE "User";
