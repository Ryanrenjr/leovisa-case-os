ALTER TABLE "Document" ADD COLUMN "isFinal" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Document" ADD COLUMN "finalizedAt" TIMESTAMP(3);

UPDATE "Document"
SET "isFinal" = true,
    "finalizedAt" = COALESCE("archivedAt", "updatedAt"),
    "archiveFolder" = NULL,
    "archivedAt" = NULL
WHERE "archiveFolder" = 'final';
