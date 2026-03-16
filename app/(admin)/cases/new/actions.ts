"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

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
  const notes = formData.get("notes")?.toString().trim() || "";

  if (!clientId || !serviceType || !country) {
    throw new Error("Client, Service Type, and Country are required.");
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

  const caseItem = await prisma.case.create({
  data: {
    caseCode,
    clientId,
    serviceType,
    country,
    assignedConsultantId: assignedConsultantId || null,
    status,
    contractStatus,
    intakeStatus,
    notes: notes || null,
  },
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
      serviceType: caseItem.serviceType,
      country: caseItem.country,
      status: caseItem.status,
    },
  },
});

redirect(`/cases/${caseItem.id}`);

}
