import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { getServiceTypeLabel } from "../../../../lib/service-options";
import { formatDateTime } from "../../../../lib/format-date";
import UploadPortalContent from "./UploadPortalContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type UploadPortalPageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
    missingChecklistItems?: string;
    duplicateChecklistItems?: string;
    alreadyUploadedChecklistItems?: string;
  }>;
};

function parseChecklistItemsParam(value?: string) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export default async function UploadPortalPage({
  params,
  searchParams,
}: UploadPortalPageProps) {
  const { token } = await params;
  const query = await searchParams;

  const isSuccess = query.success === "1";
  const error = query.error || "";
  const missingChecklistItems = parseChecklistItemsParam(
    query.missingChecklistItems
  );
  const duplicateChecklistItems = parseChecklistItemsParam(
    query.duplicateChecklistItems
  );
  const alreadyUploadedChecklistItems = parseChecklistItemsParam(
    query.alreadyUploadedChecklistItems
  );

  const submissionLink = await prisma.submissionLink.findUnique({
    where: { token },
    include: {
      case: {
        include: {
          client: true,
          checklistItems: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            include: {
              documents: {
                orderBy: { createdAt: "desc" },
                select: {
                  id: true,
                  reviewStatus: true,
                  originalFilename: true,
                  resubmissionReason: true,
                  resubmissionRequestedAt: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!submissionLink) {
    notFound();
  }

  const isExpired =
    submissionLink.expiresAt && new Date(submissionLink.expiresAt) < new Date();

  const isInactive = submissionLink.status !== "active";
  const isMaxedOut =
    submissionLink.maxUses !== null &&
    submissionLink.currentUses >= submissionLink.maxUses;

  const isUnavailable = Boolean(isExpired || isInactive || isMaxedOut);
  const checklistItems = submissionLink.case.checklistItems;
  const pendingChecklistItems = checklistItems
    .filter(
      (item) =>
        item.documents.length === 0 ||
        item.documents.some(
          (document) => document.reviewStatus === "needs_resubmission"
        )
    )
    .map((item) => {
      const resubmissionDocument =
        item.documents.find(
          (document) => document.reviewStatus === "needs_resubmission"
        ) ?? null;

      return {
        id: item.id,
        label: item.label,
        description: item.description,
        isRequired: item.isRequired,
        needsResubmission: Boolean(resubmissionDocument),
        resubmissionReason:
          resubmissionDocument?.resubmissionReason ?? null,
        resubmissionOriginalFilename:
          resubmissionDocument?.originalFilename ?? null,
        resubmissionRequestedAtText:
          resubmissionDocument?.resubmissionRequestedAt
            ? formatDateTime(resubmissionDocument.resubmissionRequestedAt)
            : resubmissionDocument?.createdAt
            ? formatDateTime(resubmissionDocument.createdAt)
            : null,
      };
    });

  return (
    <UploadPortalContent
      clientChineseName={submissionLink.case.client.chineseName || ""}
      clientEnglishName={submissionLink.case.client.englishName || ""}
      reference={submissionLink.case.reference}
      serviceType={getServiceTypeLabel(submissionLink.case.serviceType)}
      country={submissionLink.case.country}
      status={submissionLink.status}
      expiresAtText={
        submissionLink.expiresAt
          ? formatDateTime(submissionLink.expiresAt)
          : "No expiry"
      }
      token={submissionLink.token}
      isUnavailable={isUnavailable}
      isSuccess={isSuccess}
      error={error}
      missingChecklistItems={missingChecklistItems}
      duplicateChecklistItems={duplicateChecklistItems}
      alreadyUploadedChecklistItems={alreadyUploadedChecklistItems}
      hasChecklist={checklistItems.length > 0}
      checklistItems={pendingChecklistItems}
    />
  );
}
