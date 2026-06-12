"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import {
  buildCaseReferenceBase,
  generateUniqueCaseReference,
} from "../../../../lib/case-reference";
import {
  buildLegacyDependantsText,
  parseDependantInputs,
  syncCasePeople,
} from "../../../../lib/case-people";

function parseOptionalDate(value: string) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

export async function createCase(formData: FormData) {
  const clientId = formData.get("clientId")?.toString().trim() || "";
  const serviceType = formData.get("serviceType")?.toString().trim() || "";
  const country = formData.get("country")?.toString().trim() || "";
  const assignedConsultantId =
    formData.get("assignedConsultantId")?.toString().trim() || "";
  const status = formData.get("status")?.toString().trim() || "new";
  const contractStatus =
    formData.get("contractStatus")?.toString().trim() || "not_started";
  const intakeStatus =
    formData.get("intakeStatus")?.toString().trim() || "pending";
  const paymentStatus =
    formData.get("paymentStatus")?.toString().trim() || "unpaid";
  const visaExpiryDate =
    formData.get("visaExpiryDate")?.toString().trim() || "";
  const submissionDate =
    formData.get("submissionDate")?.toString().trim() || "";
  const appointmentDate =
    formData.get("appointmentDate")?.toString().trim() || "";
  const applicationCentre =
    formData.get("applicationCentre")?.toString().trim() || "";
  const dependantPeople = parseDependantInputs(formData);
  const dependants = buildLegacyDependantsText(dependantPeople);
  const notes = formData.get("notes")?.toString().trim() || "";

  if (!clientId || !serviceType || !country) {
    redirect("/cases/new?error=missing_required_fields");
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      clientCode: true,
      chineseName: true,
      englishName: true,
      email: true,
      phone: true,
      nationality: true,
    },
  });

  if (!client) {
    redirect("/cases/new?error=missing_required_fields");
  }

  const currentYear = new Date().getFullYear();

  const lastCase = await prisma.case.findFirst({
    where: {
      caseCode: {
        contains: `${currentYear}`,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      caseCode: true,
    },
  });

  let nextNumber = 1;

  if (lastCase?.caseCode) {
    const match = lastCase.caseCode.match(/-(\d{4})$/);
    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  let countryCode = "OT";

  if (country === "UK") {
    countryCode = "UK";
  } else if (country === "Spain") {
    countryCode = "ES";
  }

  const caseCode = `LVS-${countryCode}-${currentYear}-${String(nextNumber).padStart(4, "0")}`;
  const reference = await generateUniqueCaseReference(
    prisma,
    buildCaseReferenceBase({
      caseCode,
      clientCode: client.clientCode,
    })
  );

  const caseItem = await prisma.$transaction(async (tx) => {
    const createdCase = await tx.case.create({
      data: {
        caseCode,
        reference,
        clientId,
        serviceType,
        country,
        assignedConsultantId: assignedConsultantId || null,
        status,
        contractStatus,
        intakeStatus,
        visaExpiryDate: parseOptionalDate(visaExpiryDate),
        submissionDate: parseOptionalDate(submissionDate),
        appointmentDate: parseOptionalDate(appointmentDate),
        applicationCentre: applicationCentre || null,
        dependants: dependants || null,
        paymentStatus,
        notes: notes || null,
      },
    });

    await syncCasePeople(tx, createdCase.id, client, dependantPeople);

    return createdCase;
  });

  await prisma.auditLog.create({
    data: {
      caseId: caseItem.id,
      relatedEntityType: "case",
      relatedEntityId: caseItem.id,
      actionType: "create_case",
      actorType: "user",
      success: true,
      newValue: {
        caseCode: caseItem.caseCode,
        reference: caseItem.reference,
        serviceType: caseItem.serviceType,
        country: caseItem.country,
        status: caseItem.status,
        paymentStatus: caseItem.paymentStatus,
        dependantCount: dependantPeople.length,
      },
    },
  });

  redirect(`/cases/${caseItem.id}`);
}
