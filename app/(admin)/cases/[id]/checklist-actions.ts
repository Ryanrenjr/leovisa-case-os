"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

function buildChecklistRedirect(caseId: string, preserveExpanded: boolean) {
  const search = preserveExpanded ? "?checklistExpanded=1" : "";
  return `/cases/${caseId}${search}#document-checklist-section`;
}

export async function createChecklistItem(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const label = formData.get("label")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const isRequired = formData.get("isRequired")?.toString() === "on";
  const preserveExpanded =
    formData.get("preserveExpanded")?.toString().trim() === "1";

  if (!caseId || !label) {
    throw new Error("Case ID and checklist label are required.");
  }

  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  const lastItem = await prisma.documentChecklistItem.findFirst({
    where: { caseId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const item = await prisma.documentChecklistItem.create({
    data: {
      caseId,
      label,
      description: description || null,
      isRequired,
      sortOrder: (lastItem?.sortOrder ?? -1) + 1,
    },
  });

  await prisma.auditLog.create({
    data: {
      caseId,
      relatedEntityType: "document_checklist_item",
      relatedEntityId: item.id,
      actionType: "create_document_checklist_item",
      actorType: "user",
      success: true,
      newValue: {
        label: item.label,
        description: item.description,
        isRequired: item.isRequired,
        sortOrder: item.sortOrder,
      },
    },
  });

  redirect(buildChecklistRedirect(caseId, preserveExpanded));
}

export async function updateChecklistItem(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const itemId = formData.get("itemId")?.toString().trim() || "";
  const label = formData.get("label")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const isRequired = formData.get("isRequired")?.toString() === "on";
  const preserveExpanded =
    formData.get("preserveExpanded")?.toString().trim() === "1";

  if (!caseId || !itemId || !label) {
    throw new Error("Case ID, checklist item ID, and label are required.");
  }

  const existingItem = await prisma.documentChecklistItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      caseId: true,
      label: true,
      description: true,
      isRequired: true,
      sortOrder: true,
    },
  });

  if (!existingItem) {
    throw new Error("Checklist item not found.");
  }

  const [, syncedDocTypeResult, syncedDisplayNameResult] =
    await prisma.$transaction([
      prisma.documentChecklistItem.update({
        where: { id: itemId },
        data: {
          label,
          description: description || null,
          isRequired,
        },
      }),
      prisma.document.updateMany({
        where: {
          checklistItemId: itemId,
        },
        data: {
          docType: label,
        },
      }),
      prisma.document.updateMany({
        where: {
          checklistItemId: itemId,
          displayName: existingItem.label,
        },
        data: {
          displayName: label,
        },
      }),
    ]);

  await prisma.auditLog.create({
    data: {
      caseId: existingItem.caseId,
      relatedEntityType: "document_checklist_item",
      relatedEntityId: existingItem.id,
      actionType: "update_document_checklist_item",
      actorType: "user",
      success: true,
      oldValue: {
        label: existingItem.label,
        description: existingItem.description,
        isRequired: existingItem.isRequired,
        sortOrder: existingItem.sortOrder,
      },
      newValue: {
        label,
        description: description || null,
        isRequired,
        sortOrder: existingItem.sortOrder,
        syncedDocumentTypeCount: syncedDocTypeResult.count,
        syncedDocumentDisplayNameCount: syncedDisplayNameResult.count,
      },
    },
  });

  redirect(buildChecklistRedirect(caseId, preserveExpanded));
}

export async function deleteChecklistItem(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const itemId = formData.get("itemId")?.toString().trim() || "";
  const preserveExpanded =
    formData.get("preserveExpanded")?.toString().trim() === "1";

  if (!caseId || !itemId) {
    throw new Error("Case ID and checklist item ID are required.");
  }

  const existingItem = await prisma.documentChecklistItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      caseId: true,
      label: true,
      description: true,
      isRequired: true,
      sortOrder: true,
      _count: {
        select: {
          documents: true,
        },
      },
    },
  });

  if (!existingItem) {
    throw new Error("Checklist item not found.");
  }

  await prisma.documentChecklistItem.delete({
    where: { id: itemId },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingItem.caseId,
      relatedEntityType: "document_checklist_item",
      relatedEntityId: existingItem.id,
      actionType: "delete_document_checklist_item",
      actorType: "user",
      success: true,
      oldValue: {
        label: existingItem.label,
        description: existingItem.description,
        isRequired: existingItem.isRequired,
        sortOrder: existingItem.sortOrder,
        linkedDocumentCount: existingItem._count.documents,
      },
    },
  });

  redirect(buildChecklistRedirect(caseId, preserveExpanded));
}

export async function moveChecklistItemUp(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const itemId = formData.get("itemId")?.toString().trim() || "";
  const preserveExpanded =
    formData.get("preserveExpanded")?.toString().trim() === "1";

  if (!caseId || !itemId) {
    throw new Error("Case ID and checklist item ID are required.");
  }

  const currentItem = await prisma.documentChecklistItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      caseId: true,
      label: true,
      sortOrder: true,
    },
  });

  if (!currentItem) {
    throw new Error("Checklist item not found.");
  }

  const orderedItems = await prisma.documentChecklistItem.findMany({
    where: { caseId: currentItem.caseId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      label: true,
      sortOrder: true,
    },
  });

  const currentIndex = orderedItems.findIndex((item) => item.id === itemId);

  if (currentIndex <= 0) {
    redirect(buildChecklistRedirect(caseId, preserveExpanded));
  }

  const targetItem = orderedItems[currentIndex - 1];

  await prisma.$transaction([
    prisma.documentChecklistItem.update({
      where: { id: currentItem.id },
      data: { sortOrder: targetItem.sortOrder },
    }),
    prisma.documentChecklistItem.update({
      where: { id: targetItem.id },
      data: { sortOrder: currentItem.sortOrder },
    }),
  ]);

  await prisma.auditLog.create({
    data: {
      caseId: currentItem.caseId,
      relatedEntityType: "document_checklist_item",
      relatedEntityId: currentItem.id,
      actionType: "move_document_checklist_item_up",
      actorType: "user",
      success: true,
      oldValue: {
        label: currentItem.label,
        sortOrder: currentItem.sortOrder,
      },
      newValue: {
        label: currentItem.label,
        sortOrder: targetItem.sortOrder,
        swappedWithId: targetItem.id,
        swappedWithLabel: targetItem.label,
      },
    },
  });

  redirect(buildChecklistRedirect(caseId, preserveExpanded));
}

export async function moveChecklistItemDown(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const itemId = formData.get("itemId")?.toString().trim() || "";
  const preserveExpanded =
    formData.get("preserveExpanded")?.toString().trim() === "1";

  if (!caseId || !itemId) {
    throw new Error("Case ID and checklist item ID are required.");
  }

  const currentItem = await prisma.documentChecklistItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      caseId: true,
      label: true,
      sortOrder: true,
    },
  });

  if (!currentItem) {
    throw new Error("Checklist item not found.");
  }

  const orderedItems = await prisma.documentChecklistItem.findMany({
    where: { caseId: currentItem.caseId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      label: true,
      sortOrder: true,
    },
  });

  const currentIndex = orderedItems.findIndex((item) => item.id === itemId);

  if (currentIndex === -1 || currentIndex >= orderedItems.length - 1) {
    redirect(buildChecklistRedirect(caseId, preserveExpanded));
  }

  const targetItem = orderedItems[currentIndex + 1];

  await prisma.$transaction([
    prisma.documentChecklistItem.update({
      where: { id: currentItem.id },
      data: { sortOrder: targetItem.sortOrder },
    }),
    prisma.documentChecklistItem.update({
      where: { id: targetItem.id },
      data: { sortOrder: currentItem.sortOrder },
    }),
  ]);

  await prisma.auditLog.create({
    data: {
      caseId: currentItem.caseId,
      relatedEntityType: "document_checklist_item",
      relatedEntityId: currentItem.id,
      actionType: "move_document_checklist_item_down",
      actorType: "user",
      success: true,
      oldValue: {
        label: currentItem.label,
        sortOrder: currentItem.sortOrder,
      },
      newValue: {
        label: currentItem.label,
        sortOrder: targetItem.sortOrder,
        swappedWithId: targetItem.id,
        swappedWithLabel: targetItem.label,
      },
    },
  });

  redirect(buildChecklistRedirect(caseId, preserveExpanded));
}
