-- CreateEnum
CREATE TYPE "StrategyExecutionStatus" AS ENUM ('idle', 'running');

-- AlterTable
ALTER TABLE "DcaStrategy" ADD COLUMN "executionStatus" "StrategyExecutionStatus" NOT NULL DEFAULT 'idle';
ALTER TABLE "DcaStrategy" ADD COLUMN "lockedAt" TIMESTAMP(3);

-- Deduplicate txHash before unique index (keep oldest row per hash)
DELETE FROM "Purchase" a
USING "Purchase" b
WHERE a."txHash" IS NOT NULL
  AND a."txHash" = b."txHash"
  AND a."id" <> b."id"
  AND a."createdAt" > b."createdAt";

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_txHash_key" ON "Purchase"("txHash");
