/*
  Warnings:

  - You are about to drop the `Recipe` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_userID_fkey";

-- DropTable
DROP TABLE "Recipe";

-- CreateTable
CREATE TABLE "LikedRecipe" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "recipeId" TEXT NOT NULL,
    "recipeName" TEXT NOT NULL,
    "recipeImage" TEXT NOT NULL,

    CONSTRAINT "LikedRecipe_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LikedRecipe" ADD CONSTRAINT "LikedRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
