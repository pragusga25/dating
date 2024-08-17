/*
  Warnings:

  - A unique constraint covering the columns `[userId,premiumPackageId]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Purchase_userId_premiumPackageId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_userId_premiumPackageId_key" ON "Purchase"("userId", "premiumPackageId");
