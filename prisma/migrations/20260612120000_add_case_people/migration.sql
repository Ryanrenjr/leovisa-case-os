CREATE TABLE "CasePerson" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "relationship" TEXT,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "passportNumber" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasePerson_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CasePerson_caseId_idx" ON "CasePerson"("caseId");
CREATE INDEX "CasePerson_caseId_role_idx" ON "CasePerson"("caseId", "role");

ALTER TABLE "CasePerson" ADD CONSTRAINT "CasePerson_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Document" ADD COLUMN "casePersonId" TEXT;
ALTER TABLE "DocumentChecklistItem" ADD COLUMN "casePersonId" TEXT;

CREATE INDEX "Document_casePersonId_idx" ON "Document"("casePersonId");
CREATE INDEX "DocumentChecklistItem_casePersonId_idx" ON "DocumentChecklistItem"("casePersonId");

ALTER TABLE "Document" ADD CONSTRAINT "Document_casePersonId_fkey" FOREIGN KEY ("casePersonId") REFERENCES "CasePerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentChecklistItem" ADD CONSTRAINT "DocumentChecklistItem_casePersonId_fkey" FOREIGN KEY ("casePersonId") REFERENCES "CasePerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "CasePerson" (
    "id",
    "caseId",
    "role",
    "relationship",
    "fullName",
    "email",
    "phone",
    "nationality",
    "sortOrder",
    "updatedAt"
)
SELECT
    'migrated_main_' || c."id",
    c."id",
    'main_applicant',
    'Main Applicant',
    COALESCE(NULLIF(cl."englishName", ''), NULLIF(cl."chineseName", ''), 'Main Applicant'),
    cl."email",
    cl."phone",
    cl."nationality",
    0,
    CURRENT_TIMESTAMP
FROM "Case" c
JOIN "Client" cl ON cl."id" = c."clientId";
