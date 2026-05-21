-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "invoiceRef" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "billTo" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "templateName" TEXT NOT NULL,
    "versionNo" INTEGER NOT NULL DEFAULT 1,
    "generatedBy" TEXT,
    "filePath" TEXT,
    "fileUrl" TEXT,
    "pdfPath" TEXT,
    "pdfUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
