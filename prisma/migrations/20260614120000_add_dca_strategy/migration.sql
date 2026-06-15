-- CreateTable
CREATE TABLE "DcaStrategy" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "amountUsdc" DOUBLE PRECISION NOT NULL,
    "intervalHours" INTEGER NOT NULL,
    "lastExecutionAt" TIMESTAMP(3),
    "nextExecutionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DcaStrategy_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN "strategyId" TEXT;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "DcaStrategy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
