import type { Prisma, PrismaClient } from "@prisma/client";

type CasePersonInput = {
  id?: string;
  relationship: string;
  fullName: string;
  dateOfBirth: Date | null;
  nationality: string;
  passportNumber: string;
  email: string;
  phone: string;
  notes: string;
};

type CaseClientSnapshot = {
  chineseName?: string | null;
  englishName?: string | null;
  email?: string | null;
  phone?: string | null;
  nationality?: string | null;
};

type CasePersonWriter = Pick<
  PrismaClient,
  "casePerson"
>["casePerson"];

function getFormValues(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .map((value) => value.toString().trim());
}

function parseOptionalDate(value: string) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function getClientDisplayName(client: CaseClientSnapshot) {
  return (
    [client.englishName?.trim(), client.chineseName?.trim()]
      .filter(Boolean)
      .join(" / ") || "Main Applicant"
  );
}

export function parseDependantInputs(formData: FormData): CasePersonInput[] {
  const ids = getFormValues(formData, "personId");
  const relationships = getFormValues(formData, "personRelationship");
  const fullNames = getFormValues(formData, "personFullName");
  const datesOfBirth = getFormValues(formData, "personDateOfBirth");
  const nationalities = getFormValues(formData, "personNationality");
  const passportNumbers = getFormValues(formData, "personPassportNumber");
  const emails = getFormValues(formData, "personEmail");
  const phones = getFormValues(formData, "personPhone");
  const notes = getFormValues(formData, "personNotes");

  return fullNames
    .map((fullName, index) => ({
      id: ids[index] || undefined,
      relationship: relationships[index] || "",
      fullName,
      dateOfBirth: parseOptionalDate(datesOfBirth[index] || ""),
      nationality: nationalities[index] || "",
      passportNumber: passportNumbers[index] || "",
      email: emails[index] || "",
      phone: phones[index] || "",
      notes: notes[index] || "",
    }))
    .filter(
      (person) =>
        person.fullName ||
        person.relationship ||
        person.nationality ||
        person.passportNumber ||
        person.email ||
        person.phone ||
        person.notes
    );
}

export function buildLegacyDependantsText(people: CasePersonInput[]) {
  const lines = people.map((person) => {
    const prefix = person.relationship ? `${person.relationship}: ` : "";
    const suffix = [
      person.dateOfBirth ? person.dateOfBirth.toISOString().slice(0, 10) : "",
      person.nationality,
      person.passportNumber ? `Passport ${person.passportNumber}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    return `${prefix}${person.fullName}${suffix ? ` (${suffix})` : ""}`.trim();
  });

  return lines.join("\n");
}

export async function ensureMainApplicantPerson(
  writer: CasePersonWriter,
  caseId: string,
  client: CaseClientSnapshot
) {
  const existingMainApplicant = await writer.findFirst({
    where: {
      caseId,
      role: "main_applicant",
    },
    select: {
      id: true,
    },
  });

  const data = {
    role: "main_applicant",
    relationship: "Main Applicant",
    fullName: getClientDisplayName(client),
    email: client.email || null,
    phone: client.phone || null,
    nationality: client.nationality || null,
    sortOrder: 0,
  };

  if (existingMainApplicant) {
    await writer.update({
      where: { id: existingMainApplicant.id },
      data,
    });
    return;
  }

  await writer.create({
    data: {
      caseId,
      ...data,
    },
  });
}

export async function syncCasePeople(
  tx: Prisma.TransactionClient,
  caseId: string,
  client: CaseClientSnapshot,
  dependants: CasePersonInput[]
) {
  await ensureMainApplicantPerson(tx.casePerson, caseId, client);

  const existingDependants = await tx.casePerson.findMany({
    where: {
      caseId,
      role: "dependant",
    },
    select: {
      id: true,
    },
  });
  const existingIds = new Set(existingDependants.map((person) => person.id));
  const submittedIds = new Set(
    dependants
      .map((person) => person.id)
      .filter((id): id is string => Boolean(id && existingIds.has(id)))
  );

  await tx.casePerson.deleteMany({
    where: {
      caseId,
      role: "dependant",
      id: {
        notIn: Array.from(submittedIds),
      },
    },
  });

  for (const [index, person] of dependants.entries()) {
    const data = {
      role: "dependant",
      relationship: person.relationship || null,
      fullName: person.fullName || "Dependant",
      dateOfBirth: person.dateOfBirth,
      nationality: person.nationality || null,
      passportNumber: person.passportNumber || null,
      email: person.email || null,
      phone: person.phone || null,
      notes: person.notes || null,
      sortOrder: index + 1,
    };

    if (person.id && existingIds.has(person.id)) {
      await tx.casePerson.update({
        where: { id: person.id },
        data,
      });
    } else {
      await tx.casePerson.create({
        data: {
          caseId,
          ...data,
        },
      });
    }
  }
}
