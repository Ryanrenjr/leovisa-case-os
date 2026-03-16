"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

export async function updateCaseStatus(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const status = formData.get("status")?.toString().trim() || "";
  const contractStatus =
    formData.get("contractStatus")?.toString().trim() || "";
  const intakeStatus = formData.get("intakeStatus")?.toString().trim() || "";

  if (!caseId || !status || !contractStatus || !intakeStatus) {
    throw new Error(
      "Case ID, status, contract status, and intake status are required."
    );
  }

  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      status: true,
      contractStatus: true,
      intakeStatus: true,
    },
  });

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  await prisma.case.update({
    where: { id: caseId },
    data: {
      status,
      contractStatus,
      intakeStatus,
    },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingCase.id,
      relatedEntityType: "case",
      relatedEntityId: existingCase.id,
      actionType: "update_case_status",
      actorType: "user",
      success: true,
      oldValue: {
        status: existingCase.status,
        contractStatus: existingCase.contractStatus,
        intakeStatus: existingCase.intakeStatus,
      },
      newValue: {
        status,
        contractStatus,
        intakeStatus,
      },
    },
  });

  redirect(`/cases/${caseId}`);
}

export async function updateCase(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const clientId = formData.get("clientId")?.toString().trim() || "";
  const serviceType = formData.get("serviceType")?.toString().trim() || "";
  const country = formData.get("country")?.toString().trim() || "";
  const assignedConsultantId =
    formData.get("assignedConsultantId")?.toString().trim() || "";
  const status = formData.get("status")?.toString().trim() || "";
  const contractStatus =
    formData.get("contractStatus")?.toString().trim() || "";
  const intakeStatus = formData.get("intakeStatus")?.toString().trim() || "";
  const notes = formData.get("notes")?.toString().trim() || "";

  if (
    !caseId ||
    !clientId ||
    !serviceType ||
    !country ||
    !status ||
    !contractStatus ||
    !intakeStatus
  ) {
    throw new Error("Required case fields are missing.");
  }

  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      clientId: true,
      serviceType: true,
      country: true,
      assignedConsultantId: true,
      status: true,
      contractStatus: true,
      intakeStatus: true,
      notes: true,
    },
  });

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  await prisma.case.update({
    where: { id: caseId },
    data: {
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
      caseId: existingCase.id,
      relatedEntityType: "case",
      relatedEntityId: existingCase.id,
      actionType: "update_case",
      actorType: "user",
      success: true,
      oldValue: {
        clientId: existingCase.clientId,
        serviceType: existingCase.serviceType,
        country: existingCase.country,
        assignedConsultantId: existingCase.assignedConsultantId,
        status: existingCase.status,
        contractStatus: existingCase.contractStatus,
        intakeStatus: existingCase.intakeStatus,
        notes: existingCase.notes,
      },
      newValue: {
        clientId,
        serviceType,
        country,
        assignedConsultantId: assignedConsultantId || null,
        status,
        contractStatus,
        intakeStatus,
        notes: notes || null,
      },
    },
  });

  redirect(`/cases/${caseId}`);
}

export async function deleteCase(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";

  if (!caseId) {
    throw new Error("Case ID is required.");
  }

  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      documents: {
        select: { id: true },
      },
      documentSubmissions: {
        select: { id: true },
      },
      submissionLinks: {
        select: { id: true },
      },
      contracts: {
        select: { id: true },
      },
    },
  });

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  const hasLinkedData =
    existingCase.documents.length > 0 ||
    existingCase.documentSubmissions.length > 0 ||
    existingCase.submissionLinks.length > 0 ||
    existingCase.contracts.length > 0;

  if (hasLinkedData) {
  redirect(
    `/cases/${caseId}?deleteError=linked_data`
  );
}

  await prisma.auditLog.create({
    data: {
      caseId: existingCase.id,
      relatedEntityType: "case",
      relatedEntityId: existingCase.id,
      actionType: "delete_case",
      actorType: "user",
      success: true,
      oldValue: {
        caseId: existingCase.id,
        caseCode: existingCase.caseCode,
        clientId: existingCase.clientId,
        serviceType: existingCase.serviceType,
        country: existingCase.country,
        assignedConsultantId: existingCase.assignedConsultantId,
        status: existingCase.status,
        contractStatus: existingCase.contractStatus,
        intakeStatus: existingCase.intakeStatus,
        notes: existingCase.notes,
      },
    },
  });

  await prisma.case.delete({
    where: { id: caseId },
  });

  redirect("/cases");
}