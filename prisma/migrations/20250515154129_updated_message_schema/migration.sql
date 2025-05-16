/*
  Warnings:

  - You are about to drop the column `input` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `Message` table. All the data in the column will be lost.
  - Added the required column `content` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ASSISTANT');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "input",
DROP COLUMN "output",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "adminSystemPrompt" TEXT;
