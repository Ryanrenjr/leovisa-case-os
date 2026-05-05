-- CreateTable
CREATE TABLE "QuestionnaireLink" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3),
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionnaireLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireSubmission" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "answers" JSONB NOT NULL DEFAULT '{}',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionnaireSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireLink_token_key" ON "QuestionnaireLink"("token");

-- CreateIndex
CREATE INDEX "QuestionnaireLink_caseId_createdAt_idx" ON "QuestionnaireLink"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "QuestionnaireSubmission_caseId_updatedAt_idx" ON "QuestionnaireSubmission"("caseId", "updatedAt");

-- CreateIndex
CREATE INDEX "QuestionnaireSubmission_linkId_updatedAt_idx" ON "QuestionnaireSubmission"("linkId", "updatedAt");

-- AddForeignKey
ALTER TABLE "QuestionnaireLink" ADD CONSTRAINT "QuestionnaireLink_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireSubmission" ADD CONSTRAINT "QuestionnaireSubmission_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireSubmission" ADD CONSTRAINT "QuestionnaireSubmission_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "QuestionnaireLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
