"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "../../../../lib/prisma";

function buildChecklistRedirect(caseId: string, preserveExpanded: boolean) {
  const searchParams = new URLSearchParams({ tab: "documents" });

  if (preserveExpanded) {
    searchParams.set("checklistExpanded", "1");
  }

  return `/cases/${caseId}?${searchParams.toString()}#document-checklist-section`;
}

function redirectToChecklist(caseId: string, preserveExpanded: boolean) {
  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/");
  redirect(buildChecklistRedirect(caseId, preserveExpanded));
}

type ChecklistTemplatePayloadItem = {
  label?: unknown;
  description?: unknown;
  isRequired?: unknown;
};

function parseTemplateItems(value: string) {
  const parsed = JSON.parse(value) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Checklist template payload must be an array.");
  }

  return parsed
    .map((item): ChecklistTemplatePayloadItem =>
      item && typeof item === "object" ? item : {}
    )
    .map((item) => ({
      label: typeof item.label === "string" ? item.label.trim() : "",
      description:
        typeof item.description === "string" ? item.description.trim() : "",
      isRequired: item.isRequired !== false,
    }))
    .filter((item) => item.label);
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

  redirectToChecklist(caseId, preserveExpanded);
}

export async function applyChecklistTemplate(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const templateKey = formData.get("templateKey")?.toString().trim() || "";
  const rawItems = formData.get("templateItems")?.toString().trim() || "";
  const mode = formData.get("templateMode")?.toString().trim() || "append";
  const preserveExpanded =
    formData.get("preserveExpanded")?.toString().trim() === "1";

  if (!caseId || !rawItems) {
    throw new Error("Case ID and checklist template items are required.");
  }

  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  let items: ReturnType<typeof parseTemplateItems>;

  try {
    items = parseTemplateItems(rawItems);
  } catch {
    throw new Error("Checklist template items are invalid.");
  }

  if (items.length === 0) {
    throw new Error("Please keep at least one checklist item.");
  }

  const shouldReplace = mode === "replace";
  const lastItem = shouldReplace
    ? null
    : await prisma.documentChecklistItem.findFirst({
        where: { caseId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
  const startSortOrder = (lastItem?.sortOrder ?? -1) + 1;

  const results = await prisma.$transaction([
    ...(shouldReplace
      ? [
          prisma.documentChecklistItem.deleteMany({
            where: { caseId },
          }),
        ]
      : []),
    prisma.documentChecklistItem.createMany({
      data: items.map((item, index) => ({
        caseId,
        label: item.label,
        description: item.description || null,
        isRequired: item.isRequired,
        sortOrder: startSortOrder + index,
      })),
    }),
  ]);
  const createResult = results.at(-1);

  await prisma.auditLog.create({
    data: {
      caseId,
      relatedEntityType: "document_checklist",
      relatedEntityId: caseId,
      actionType: shouldReplace
        ? "replace_document_checklist_from_template"
        : "append_document_checklist_from_template",
      actorType: "user",
      success: true,
      newValue: {
        templateKey,
        itemCount: createResult?.count ?? items.length,
        mode: shouldReplace ? "replace" : "append",
      },
    },
  });

  redirectToChecklist(caseId, preserveExpanded);
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

  redirectToChecklist(caseId, preserveExpanded);
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

  redirectToChecklist(caseId, preserveExpanded);
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
    redirectToChecklist(caseId, preserveExpanded);
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

  redirectToChecklist(caseId, preserveExpanded);
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
    redirectToChecklist(caseId, preserveExpanded);
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

  redirectToChecklist(caseId, preserveExpanded);
}

export async function reorderChecklistItems(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const rawItemIds = formData.get("itemIds")?.toString().trim() || "";

  if (!caseId || !rawItemIds) {
    throw new Error("Case ID and checklist item order are required.");
  }

  let itemIds: string[];

  try {
    const parsed = JSON.parse(rawItemIds) as unknown;
    itemIds = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    throw new Error("Checklist item order is invalid.");
  }

  if (itemIds.length === 0) {
    throw new Error("Checklist item order is empty.");
  }

  const existingItems = await prisma.documentChecklistItem.findMany({
    where: { caseId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      label: true,
      sortOrder: true,
    },
  });
  const existingIds = new Set(existingItems.map((item) => item.id));
  const hasSameItems =
    existingItems.length === itemIds.length &&
    itemIds.every((itemId) => existingIds.has(itemId)) &&
    new Set(itemIds).size === itemIds.length;

  if (!hasSameItems) {
    throw new Error("Checklist item order does not match this case.");
  }

  await prisma.$transaction(
    itemIds.map((itemId, index) =>
      prisma.documentChecklistItem.update({
        where: { id: itemId },
        data: { sortOrder: index },
      })
    )
  );

  await prisma.auditLog.create({
    data: {
      caseId,
      relatedEntityType: "document_checklist",
      relatedEntityId: caseId,
      actionType: "reorder_document_checklist_items",
      actorType: "user",
      success: true,
      oldValue: {
        itemIds: existingItems.map((item) => item.id),
        labels: existingItems.map((item) => item.label),
      },
      newValue: {
        itemIds,
      },
    },
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/");
}
