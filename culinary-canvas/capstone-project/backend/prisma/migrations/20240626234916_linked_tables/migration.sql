/*
  Warnings:

  - Added the required column `userID` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "userID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
