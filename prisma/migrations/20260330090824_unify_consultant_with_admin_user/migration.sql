-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_assignedConsultantId_fkey";

-- AlterTable
ALTER TABLE "Case" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "contractStatus" DROP DEFAULT,
ALTER COLUMN "intakeStatus" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_assignedConsultantId_fkey" FOREIGN KEY ("assignedConsultantId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
