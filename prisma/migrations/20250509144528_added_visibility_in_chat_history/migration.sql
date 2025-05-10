-- CreateEnum
CREATE TYPE "ChatHistoryVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "ChatHistory" ADD COLUMN     "visibility" "ChatHistoryVisibility" NOT NULL DEFAULT 'PUBLIC';
