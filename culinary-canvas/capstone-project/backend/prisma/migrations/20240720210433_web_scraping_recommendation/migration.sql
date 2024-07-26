-- CreateTable
CREATE TABLE "SuggestedRecipe" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "calories" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "ScrapedRecipeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuggestedRecipe_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SuggestedRecipe" ADD CONSTRAINT "SuggestedRecipe_ScrapedRecipeId_fkey" FOREIGN KEY ("ScrapedRecipeId") REFERENCES "ScrapedRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
