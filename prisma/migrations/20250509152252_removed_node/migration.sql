/*
  Warnings:

  - You are about to drop the `Node` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `RoadMap` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_roadMapId_fkey";

-- AlterTable
ALTER TABLE "RoadMap" ADD COLUMN     "content" TEXT NOT NULL;

-- DropTable
DROP TABLE "Node";
