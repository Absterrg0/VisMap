/*
  Warnings:

  - You are about to drop the `CodeSnippet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CodeSnippet" DROP CONSTRAINT "CodeSnippet_nodeId_fkey";

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "content" TEXT;

-- DropTable
DROP TABLE "CodeSnippet";
