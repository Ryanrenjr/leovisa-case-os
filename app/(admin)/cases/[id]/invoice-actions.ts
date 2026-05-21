"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { removeStorageFiles } from "../../../../lib/supabase-admin";

export async function deleteInvoice(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const invoiceId = formData.get("invoiceId")?.toString().trim() || "";

  if (!caseId || !invoiceId) {
    throw new Error("Case ID and Invoice ID are required.");
  }

  const existingInvoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      caseId: true,
      invoiceRef: true,
      billTo: true,
      instructions: true,
      items: true,
      subtotal: true,
      total: true,
      filePath: true,
      fileUrl: true,
      pdfPath: true,
      pdfUrl: true,
      status: true,
    },
  });

  if (!existingInvoice || existingInvoice.caseId !== caseId) {
    throw new Error("Invoice not found.");
  }

  const storagePaths = [existingInvoice.filePath, existingInvoice.pdfPath].filter(
    (value): value is string => Boolean(value)
  );

  if (storagePaths.length > 0) {
    try {
      await removeStorageFiles(Array.from(new Set(storagePaths)));
    } catch (error) {
      console.error("Failed to remove invoice files from storage:", error);
    }
  }

  await prisma.invoice.delete({
    where: { id: invoiceId },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingInvoice.caseId,
      relatedEntityType: "invoice",
      relatedEntityId: existingInvoice.id,
      actionType: "delete_invoice",
      actorType: "user",
      success: true,
      oldValue: {
        invoiceRef: existingInvoice.invoiceRef,
        billTo: existingInvoice.billTo,
        instructions: existingInvoice.instructions,
        items: existingInvoice.items,
        subtotal: existingInvoice.subtotal,
        total: existingInvoice.total,
        filePath: existingInvoice.filePath,
        fileUrl: existingInvoice.fileUrl,
        pdfPath: existingInvoice.pdfPath,
        pdfUrl: existingInvoice.pdfUrl,
        status: existingInvoice.status,
      },
    },
  });

  redirect(`/cases/${caseId}#invoices-section`);
}
