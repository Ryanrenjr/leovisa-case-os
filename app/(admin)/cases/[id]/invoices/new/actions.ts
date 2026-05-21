"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../../lib/prisma";
import { convertDocxBufferToPdf } from "../../../../../../lib/contracts/convert-docx-to-pdf";
import { getServiceTypeLabel } from "../../../../../../lib/service-options";
import {
  createStorageSignedUrl,
  uploadBufferToStorage,
} from "../../../../../../lib/supabase-admin";
import {
  generateInvoice,
  type InvoiceLineItem,
} from "../../../../../../lib/invoices/generate-invoice";

type ActionState = {
  error?: string;
};

function formatDateForInvoice(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB");
}

function parseAmount(value: string) {
  const normalized = value.replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return `\u00a3${value.toFixed(2)}`;
}

function getFormValues(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .map((value) => value.toString().trim());
}

export async function createInvoiceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const invoiceRef = formData.get("invoiceRef")?.toString().trim() || "";
  const invoiceDate = formData.get("invoiceDate")?.toString().trim() || "";
  const billTo = formData.get("billTo")?.toString().trim() || "";
  const instructions = formData.get("instructions")?.toString().trim() || "";

  const quantities = getFormValues(formData, "quantity");
  const descriptions = getFormValues(formData, "description");
  const totals = getFormValues(formData, "lineTotal");

  const items: InvoiceLineItem[] = descriptions
    .map((description, index) => ({
      quantity: quantities[index] || "1",
      description,
      total: totals[index] || "",
    }))
    .filter((item) => item.description || item.total);

  if (!caseId || !invoiceRef || !invoiceDate || !billTo || !instructions) {
    return { error: "Please complete all required invoice fields." };
  }

  if (items.length === 0) {
    return { error: "Please add at least one invoice line item." };
  }

  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      client: true,
    },
  });

  if (!caseItem) {
    return { error: "Case not found." };
  }

  try {
    const subtotalValue = items.reduce(
      (sum, item) => sum + parseAmount(item.total),
      0
    );
    const subtotal = formatCurrency(subtotalValue);
    const renderedItems = items.map((item) => {
      const lineTotal = item.total.trim();

      return {
        ...item,
        total: lineTotal
          ? lineTotal.startsWith("\u00a3")
            ? lineTotal
            : formatCurrency(parseAmount(lineTotal))
          : "",
      };
    });

    const fileBuffer = await generateInvoice({
      invoiceRef,
      invoiceDate: formatDateForInvoice(invoiceDate),
      billTo,
      instructions,
      items: renderedItems,
      subtotal,
      total: subtotal,
    });

    const safeCaseCode = caseItem.caseCode.replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeInvoiceRef = invoiceRef.replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeBillTo = billTo.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${safeInvoiceRef}_${safeBillTo}_invoice.docx`;
    const storagePath = `${safeCaseCode}/invoices/${Date.now()}_${fileName}`;
    const pdfFileName = fileName.replace(/\.docx$/i, ".pdf");
    const pdfStoragePath = `${safeCaseCode}/invoices/${Date.now()}_${pdfFileName}`;

    await uploadBufferToStorage(
      storagePath,
      fileBuffer,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    const fileUrl = await createStorageSignedUrl(storagePath);

    let generatedPdfPath: string | null = null;
    let generatedPdfUrl: string | null = null;

    try {
      const pdfBuffer = await convertDocxBufferToPdf(fileBuffer, fileName);

      await uploadBufferToStorage(pdfStoragePath, pdfBuffer, "application/pdf");

      generatedPdfPath = pdfStoragePath;
      generatedPdfUrl = await createStorageSignedUrl(pdfStoragePath);
    } catch (error) {
      console.warn("Invoice PDF conversion skipped:", error);
    }

    const invoice = await prisma.invoice.create({
      data: {
        caseId: caseItem.id,
        invoiceRef,
        invoiceDate: new Date(`${invoiceDate}T00:00:00`),
        billTo,
        instructions,
        items: renderedItems,
        subtotal: subtotalValue,
        total: subtotalValue,
        templateName: "invoice-template",
        versionNo: 1,
        generatedBy: null,
        filePath: storagePath,
        fileUrl,
        pdfPath: generatedPdfPath,
        pdfUrl: generatedPdfUrl,
        status: "generated",
      },
    });

    await prisma.auditLog.create({
      data: {
        caseId: caseItem.id,
        relatedEntityType: "invoice",
        relatedEntityId: invoice.id,
        actionType: "generate_invoice",
        actorType: "user",
        success: true,
        newValue: {
          templateName: "invoice-template",
          caseCode: caseItem.caseCode,
          reference: caseItem.reference,
          invoiceRef,
          billTo,
          instructions,
          serviceType: getServiceTypeLabel(caseItem.serviceType),
          items: renderedItems,
          subtotal,
          total: subtotal,
          filePath: storagePath,
          fileUrl,
          pdfPath: generatedPdfPath,
          pdfUrl: generatedPdfUrl,
        },
      },
    });

    redirect(`/cases/${caseItem.id}#invoices-section`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Create invoice failed:", error);

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Failed to generate invoice." };
  }
}
