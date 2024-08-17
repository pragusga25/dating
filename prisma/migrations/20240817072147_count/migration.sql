-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailySwipesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;
