"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "../../../../lib/prisma";
import { normalizeReference } from "../../../../lib/case-reference";
import { removeStorageFiles } from "../../../../lib/supabase-admin";

function parseOptionalDate(value: string) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

export async function updateCaseStatus(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const status = formData.get("status")?.toString().trim() || "";
  const contractStatus =
    formData.get("contractStatus")?.toString().trim() || "";
  const intakeStatus = formData.get("intakeStatus")?.toString().trim() || "";
  const paymentStatus =
    formData.get("paymentStatus")?.toString().trim() || "unpaid";

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
      paymentStatus: true,
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
      paymentStatus,
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
        paymentStatus: existingCase.paymentStatus,
      },
      newValue: {
        status,
        contractStatus,
        intakeStatus,
        paymentStatus,
      },
    },
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/");
  redirect(`/cases/${caseId}`);
}

export async function updateCase(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const referenceInput = formData.get("reference")?.toString().trim() || "";
  const clientId = formData.get("clientId")?.toString().trim() || "";
  const serviceType = formData.get("serviceType")?.toString().trim() || "";
  const country = formData.get("country")?.toString().trim() || "";
  const assignedConsultantId =
    formData.get("assignedConsultantId")?.toString().trim() || "";
  const status = formData.get("status")?.toString().trim() || "";
  const contractStatus =
    formData.get("contractStatus")?.toString().trim() || "";
  const intakeStatus = formData.get("intakeStatus")?.toString().trim() || "";
  const paymentStatus =
    formData.get("paymentStatus")?.toString().trim() || "unpaid";
  const notes = formData.get("notes")?.toString().trim() || "";
  const visaExpiryDate =
    formData.get("visaExpiryDate")?.toString().trim() || "";
  const submissionDate =
    formData.get("submissionDate")?.toString().trim() || "";
  const appointmentDate =
    formData.get("appointmentDate")?.toString().trim() || "";
  const applicationCentre =
    formData.get("applicationCentre")?.toString().trim() || "";
  const dependants = formData.get("dependants")?.toString().trim() || "";
  const immigrationPortalUrl =
    formData.get("immigrationPortalUrl")?.toString().trim() || "";
  const immigrationPortalUsername =
    formData.get("immigrationPortalUsername")?.toString().trim() || "";
  const immigrationPortalPassword =
    formData.get("immigrationPortalPassword")?.toString().trim() || "";

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
      caseCode: true,
      reference: true,
      clientId: true,
      serviceType: true,
      country: true,
      assignedConsultantId: true,
      status: true,
      contractStatus: true,
      intakeStatus: true,
      visaExpiryDate: true,
      submissionDate: true,
      appointmentDate: true,
      applicationCentre: true,
      dependants: true,
      paymentStatus: true,
      notes: true,
      immigrationPortalUrl: true,
      immigrationPortalUsername: true,
      immigrationPortalPassword: true,
    },
  });

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  const reference = normalizeReference(referenceInput);

  if (!reference) {
    redirect(`/cases/${caseId}/edit?error=missing_reference`);
  }

  const duplicateReferenceCase = await prisma.case.findFirst({
    where: {
      id: {
        not: caseId,
      },
      reference,
    },
    select: {
      id: true,
    },
  });

  if (duplicateReferenceCase) {
    redirect(`/cases/${caseId}/edit?error=duplicate_reference`);
  }

  await prisma.case.update({
    where: { id: caseId },
    data: {
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
      immigrationPortalUrl: immigrationPortalUrl || null,
      immigrationPortalUsername: immigrationPortalUsername || null,
      immigrationPortalPassword: immigrationPortalPassword || null,
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
        caseCode: existingCase.caseCode,
        reference: existingCase.reference,
        clientId: existingCase.clientId,
        serviceType: existingCase.serviceType,
        country: existingCase.country,
        assignedConsultantId: existingCase.assignedConsultantId,
        status: existingCase.status,
        contractStatus: existingCase.contractStatus,
        intakeStatus: existingCase.intakeStatus,
        visaExpiryDate: existingCase.visaExpiryDate,
        submissionDate: existingCase.submissionDate,
        appointmentDate: existingCase.appointmentDate,
        applicationCentre: existingCase.applicationCentre,
        dependants: existingCase.dependants,
        paymentStatus: existingCase.paymentStatus,
        notes: existingCase.notes,
        immigrationPortalUrl: existingCase.immigrationPortalUrl,
        immigrationPortalUsername: existingCase.immigrationPortalUsername,
        immigrationPortalPassword: existingCase.immigrationPortalPassword
          ? "[stored]"
          : null,
      },
      newValue: {
        caseCode: existingCase.caseCode,
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
        immigrationPortalUrl: immigrationPortalUrl || null,
        immigrationPortalUsername: immigrationPortalUsername || null,
        immigrationPortalPassword: immigrationPortalPassword ? "[stored]" : null,
      },
    },
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/");
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
        select: {
          id: true,
          storagePath: true,
        },
      },
      submissions: {
        select: { id: true },
      },
      submissionLinks: {
        select: { id: true },
      },
      questionnaireLinks: {
        select: { id: true },
      },
      questionnaireSubmissions: {
        select: { id: true },
      },
      checklistItems: {
        select: { id: true },
      },
      contracts: {
        select: {
          id: true,
          filePath: true,
          pdfPath: true,
          signedPdfPath: true,
        },
      },
      invoices: {
        select: {
          id: true,
          filePath: true,
          pdfPath: true,
        },
      },
      paymentRecords: {
        select: { id: true },
      },
    },
  });

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  const storagePaths = [
    ...existingCase.documents.map((document) => document.storagePath),
    ...existingCase.contracts.flatMap((contract) => [
      contract.filePath,
      contract.pdfPath,
      contract.signedPdfPath,
    ]),
    ...existingCase.invoices.flatMap((invoice) => [
      invoice.filePath,
      invoice.pdfPath,
    ]),
  ].filter((value): value is string => Boolean(value));

  if (storagePaths.length > 0) {
    await removeStorageFiles(Array.from(new Set(storagePaths)));
  }

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.deleteMany({
      where: { caseId },
    });
    await tx.document.deleteMany({
      where: { caseId },
    });
    await tx.documentSubmission.deleteMany({
      where: { caseId },
    });
    await tx.submissionLink.deleteMany({
      where: { caseId },
    });
    await tx.questionnaireSubmission.deleteMany({
      where: { caseId },
    });
    await tx.questionnaireLink.deleteMany({
      where: { caseId },
    });
    await tx.documentChecklistItem.deleteMany({
      where: { caseId },
    });
    await tx.contract.deleteMany({
      where: { caseId },
    });
    await tx.invoice.deleteMany({
      where: { caseId },
    });
    await tx.casePaymentRecord.deleteMany({
      where: { caseId },
    });
    await tx.case.delete({
      where: { id: caseId },
    });
    await tx.auditLog.create({
      data: {
        caseId: null,
        relatedEntityType: "case",
        relatedEntityId: existingCase.id,
        actionType: "delete_case_with_related_data",
        actorType: "user",
        success: true,
        oldValue: {
          caseId: existingCase.id,
          caseCode: existingCase.caseCode,
          reference: existingCase.reference,
          clientId: existingCase.clientId,
          serviceType: existingCase.serviceType,
          country: existingCase.country,
          assignedConsultantId: existingCase.assignedConsultantId,
          status: existingCase.status,
          contractStatus: existingCase.contractStatus,
          intakeStatus: existingCase.intakeStatus,
          paymentStatus: existingCase.paymentStatus,
          notes: existingCase.notes,
        },
        metadata: {
          deletedCounts: {
            documents: existingCase.documents.length,
            submissions: existingCase.submissions.length,
            submissionLinks: existingCase.submissionLinks.length,
            questionnaireLinks: existingCase.questionnaireLinks.length,
            questionnaireSubmissions:
              existingCase.questionnaireSubmissions.length,
            checklistItems: existingCase.checklistItems.length,
            contracts: existingCase.contracts.length,
            invoices: existingCase.invoices.length,
            paymentRecords: existingCase.paymentRecords.length,
            storageFiles: Array.from(new Set(storagePaths)).length,
          },
        },
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/cases");
  redirect("/cases");
}

export async function createPaymentRecord(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const label = formData.get("label")?.toString().trim() || "";
  const amountInput = formData.get("amount")?.toString().trim() || "";
  const currency = formData.get("currency")?.toString().trim() || "GBP";
  const paymentDate = formData.get("paymentDate")?.toString().trim() || "";
  const method = formData.get("method")?.toString().trim() || "";
  const status = formData.get("status")?.toString().trim() || "received";
  const notes = formData.get("notes")?.toString().trim() || "";

  const amount = Number(amountInput);

  if (!caseId || !Number.isFinite(amount) || amount < 0) {
    throw new Error("Case ID and a valid payment amount are required.");
  }

  const paymentRecord = await prisma.casePaymentRecord.create({
    data: {
      caseId,
      label: label || null,
      amount,
      currency,
      paymentDate: parseOptionalDate(paymentDate),
      method: method || null,
      status,
      notes: notes || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      caseId,
      relatedEntityType: "payment_record",
      relatedEntityId: paymentRecord.id,
      actionType: "create_payment_record",
      actorType: "user",
      success: true,
      newValue: {
        label: paymentRecord.label,
        amount: paymentRecord.amount.toString(),
        currency: paymentRecord.currency,
        paymentDate: paymentRecord.paymentDate,
        method: paymentRecord.method,
        status: paymentRecord.status,
        notes: paymentRecord.notes,
      },
    },
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/");
  redirect(`/cases/${caseId}?tab=invoices#payment-records-section`);
}

export async function deletePaymentRecord(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const paymentRecordId =
    formData.get("paymentRecordId")?.toString().trim() || "";

  if (!caseId || !paymentRecordId) {
    throw new Error("Case ID and payment record ID are required.");
  }

  const existingRecord = await prisma.casePaymentRecord.findUnique({
    where: { id: paymentRecordId },
  });

  if (!existingRecord || existingRecord.caseId !== caseId) {
    throw new Error("Payment record not found.");
  }

  await prisma.casePaymentRecord.delete({
    where: { id: paymentRecordId },
  });

  await prisma.auditLog.create({
    data: {
      caseId,
      relatedEntityType: "payment_record",
      relatedEntityId: paymentRecordId,
      actionType: "delete_payment_record",
      actorType: "user",
      success: true,
      oldValue: {
        label: existingRecord.label,
        amount: existingRecord.amount.toString(),
        currency: existingRecord.currency,
        paymentDate: existingRecord.paymentDate,
        method: existingRecord.method,
        status: existingRecord.status,
        notes: existingRecord.notes,
      },
    },
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/");
  redirect(`/cases/${caseId}?tab=invoices#payment-records-section`);
}
