import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getAdminSessionUserId } from "../../../../../../lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const adminUserId = await getAdminSessionUserId();

  if (!adminUserId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: caseId } = await context.params;
  const body = await request.json().catch(() => null);
  const itemIds: string[] = Array.isArray(body?.itemIds)
    ? body.itemIds.filter((item: unknown): item is string => typeof item === "string")
    : [];

  if (!caseId || itemIds.length === 0) {
    return NextResponse.json(
      { error: "Case ID and checklist item order are required." },
      { status: 400 }
    );
  }

  const existingItems = await prisma.documentChecklistItem.findMany({
    where: { caseId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      label: true,
    },
  });
  const existingIds = new Set(existingItems.map((item) => item.id));
  const hasSameItems =
    existingItems.length === itemIds.length &&
    itemIds.every((itemId) => existingIds.has(itemId)) &&
    new Set(itemIds).size === itemIds.length;

  if (!hasSameItems) {
    return NextResponse.json(
      { error: "Checklist item order does not match this case." },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    ...itemIds.map((itemId, index) =>
      prisma.documentChecklistItem.update({
        where: { id: itemId },
        data: { sortOrder: index },
      })
    ),
    prisma.auditLog.create({
      data: {
        caseId,
        relatedEntityType: "document_checklist",
        relatedEntityId: caseId,
        actionType: "reorder_document_checklist_items",
        actorType: "user",
        actorId: adminUserId,
        success: true,
        oldValue: {
          itemIds: existingItems.map((item) => item.id),
          labels: existingItems.map((item) => item.label),
        },
        newValue: {
          itemIds,
        },
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
