/*
  Warnings:

  - You are about to drop the `SuggestedRecipe` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SuggestedRecipe" DROP CONSTRAINT "SuggestedRecipe_ScrapedRecipeId_fkey";

-- DropTable
DROP TABLE "SuggestedRecipe";
