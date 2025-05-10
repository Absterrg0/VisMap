/*
  Warnings:

  - You are about to drop the column `projectId` on the `RoadMap` table. All the data in the column will be lost.
  - Added the required column `chatHistoryId` to the `RoadMap` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RoadMap" DROP CONSTRAINT "RoadMap_projectId_fkey";

-- AlterTable
ALTER TABLE "RoadMap" DROP COLUMN "projectId",
ADD COLUMN     "chatHistoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RoadMap" ADD CONSTRAINT "RoadMap_chatHistoryId_fkey" FOREIGN KEY ("chatHistoryId") REFERENCES "ChatHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
