import type { PrismaClient } from "@prisma/client";

function collapseDashes(value: string) {
  return value.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function normalizeReference(value: string) {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-");

  return collapseDashes(normalized);
}

export function buildCaseReferenceBase(params: {
  caseCode: string;
  clientCode?: string | null;
}) {
  const normalizedClientCode = normalizeReference(params.clientCode || "");

  if (normalizedClientCode) {
    return normalizeReference(`LVS-${normalizedClientCode}`);
  }

  return normalizeReference(params.caseCode);
}

export async function generateUniqueCaseReference(
  db: PrismaClient,
  baseReference: string,
  options?: {
    excludeCaseId?: string;
  }
) {
  const normalizedBase = normalizeReference(baseReference);

  if (!normalizedBase) {
    throw new Error("Reference is required.");
  }

  const existingCases = await db.case.findMany({
    where: {
      reference: {
        startsWith: normalizedBase,
      },
      ...(options?.excludeCaseId
        ? {
            id: {
              not: options.excludeCaseId,
            },
          }
        : {}),
    },
    select: {
      reference: true,
    },
  });

  const existingReferences = new Set(
    existingCases.map((item) => item.reference.toUpperCase())
  );

  if (!existingReferences.has(normalizedBase)) {
    return normalizedBase;
  }

  let suffix = 2;

  while (true) {
    const candidate = `${normalizedBase}-${String(suffix).padStart(2, "0")}`;

    if (!existingReferences.has(candidate)) {
      return candidate;
    }

    suffix += 1;
  }
}
