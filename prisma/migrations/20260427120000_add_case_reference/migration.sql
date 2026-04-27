ALTER TABLE "Case" ADD COLUMN "reference" TEXT;

UPDATE "Case"
SET "reference" = "caseCode"
WHERE "reference" IS NULL;

ALTER TABLE "Case" ALTER COLUMN "reference" SET NOT NULL;

CREATE UNIQUE INDEX "Case_reference_key" ON "Case"("reference");
