-- CreateTable
CREATE TABLE "MealPlanner" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "recipeName" TEXT NOT NULL,
    "recipeImage" TEXT NOT NULL,
    "recipeUrl" TEXT NOT NULL,

    CONSTRAINT "MealPlanner_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MealPlanner" ADD CONSTRAINT "MealPlanner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
