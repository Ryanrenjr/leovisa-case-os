ALTER TABLE "Case"
ADD COLUMN "visaExpiryDate" TIMESTAMP(3),
ADD COLUMN "submissionDate" TIMESTAMP(3),
ADD COLUMN "appointmentDate" TIMESTAMP(3),
ADD COLUMN "applicationCentre" TEXT,
ADD COLUMN "dependants" TEXT,
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid';

CREATE TABLE "CasePaymentRecord" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "label" TEXT,
  "amount" DECIMAL(10, 2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'GBP',
  "paymentDate" TIMESTAMP(3),
  "method" TEXT,
  "status" TEXT NOT NULL DEFAULT 'received',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CasePaymentRecord_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CasePaymentRecord"
ADD CONSTRAINT "CasePaymentRecord_caseId_fkey"
FOREIGN KEY ("caseId") REFERENCES "Case"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "CasePaymentRecord_caseId_idx" ON "CasePaymentRecord"("caseId");
