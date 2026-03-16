import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import UploadPortalContent from "./UploadPortalContent";

type UploadPortalPageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function UploadPortalPage({
  params,
  searchParams,
}: UploadPortalPageProps) {
  const { token } = await params;
  const query = await searchParams;
  const isSuccess = query.success === "1";

  const submissionLink = await prisma.submissionLink.findUnique({
    where: { token },
    include: {
      case: {
        include: {
          client: true,
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
      clientChineseName={submissionLink.case.client.chineseName}
      clientEnglishName={submissionLink.case.client.englishName}
      caseCode={submissionLink.case.caseCode}
      serviceType={submissionLink.case.serviceType}
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
    />
  );
}
