/*
  Warnings:

  - Added the required column `healthScore` to the `MealPlanner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MealPlanner" ADD COLUMN     "healthScore" DOUBLE PRECISION NOT NULL;
