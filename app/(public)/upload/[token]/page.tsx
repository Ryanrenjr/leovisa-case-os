import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { getServiceTypeLabel } from "../../../../lib/service-options";
import UploadPortalContent from "./UploadPortalContent";

type UploadPortalPageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
    missingChecklistItems?: string;
    duplicateChecklistItems?: string;
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

  const submissionLink = await prisma.submissionLink.findUnique({
    where: { token },
    include: {
      case: {
        include: {
          client: true,
          checklistItems: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
          ? new Date(submissionLink.expiresAt).toLocaleString()
          : "No expiry"
      }
      token={submissionLink.token}
      isUnavailable={isUnavailable}
      isSuccess={isSuccess}
      error={error}
      missingChecklistItems={missingChecklistItems}
      duplicateChecklistItems={duplicateChecklistItems}
      checklistItems={submissionLink.case.checklistItems}
    />
  );
}
