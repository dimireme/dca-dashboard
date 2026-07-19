-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN "txHash" TEXT;

-- Migrate tx hashes previously stored as notes ("tx:0x...")
UPDATE "Purchase"
SET "txHash" = SUBSTRING("notes" FROM 4)
WHERE "notes" LIKE 'tx:%';

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "notes";
