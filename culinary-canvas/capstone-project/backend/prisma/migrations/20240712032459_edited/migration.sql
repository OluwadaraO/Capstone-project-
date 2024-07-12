/*
  Warnings:

  - You are about to drop the `MealPlanner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MealPlanner" DROP CONSTRAINT "MealPlanner_userId_fkey";

-- DropTable
DROP TABLE "MealPlanner";
