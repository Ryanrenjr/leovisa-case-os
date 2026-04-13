ALTER TABLE "Contract"
ADD COLUMN "pdfPath" TEXT,
ADD COLUMN "pdfUrl" TEXT,
ADD COLUMN "signedPdfPath" TEXT,
ADD COLUMN "signedPdfUrl" TEXT,
ADD COLUMN "signProvider" TEXT,
ADD COLUMN "signDeliveryMode" TEXT,
ADD COLUMN "signerName" TEXT,
ADD COLUMN "signerEmail" TEXT,
ADD COLUMN "providerDocumentId" INTEGER,
ADD COLUMN "providerRecipientId" INTEGER,
ADD COLUMN "providerSigningToken" TEXT,
ADD COLUMN "providerSigningUrl" TEXT,
ADD COLUMN "providerDocumentStatus" TEXT,
ADD COLUMN "providerRecipientStatus" TEXT,
ADD COLUMN "signatureError" TEXT,
ADD COLUMN "sentAt" TIMESTAMP(3),
ADD COLUMN "openedAt" TIMESTAMP(3),
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "rejectedAt" TIMESTAMP(3),
ADD COLUMN "lastWebhookAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Contract_providerDocumentId_key" ON "Contract"("providerDocumentId");
