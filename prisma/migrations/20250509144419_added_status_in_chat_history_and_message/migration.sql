/*
  Warnings:

  - Added the required column `version` to the `RoadMap` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChatHistoryStatus" AS ENUM ('ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('ACTIVE', 'DELETED');

-- AlterTable
ALTER TABLE "ChatHistory" ADD COLUMN     "status" "ChatHistoryStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "RoadMap" ADD COLUMN     "version" TEXT NOT NULL;
