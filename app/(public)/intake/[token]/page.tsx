import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { getServiceTypeLabel } from "../../../../lib/service-options";
import { getQuestionnaireTemplateSnapshot } from "../../../../lib/questionnaires/templates";
import { formatDateTime } from "../../../../lib/format-date";
import IntakeFormContent from "./IntakeFormContent";

type IntakePageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    saved?: string;
    submitted?: string;
    error?: string;
  }>;
};

export default async function IntakePage({
  params,
  searchParams,
}: IntakePageProps) {
  const { token } = await params;
  const query = await searchParams;

  const link = await prisma.questionnaireLink.findUnique({
    where: { token },
    include: {
      case: {
        include: {
          client: true,
        },
      },
      submissions: {
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!link) {
    notFound();
  }

  const template = getQuestionnaireTemplateSnapshot(
    link.templateKey,
    link.customTemplate
  );

  if (!template) {
    notFound();
  }

  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
  const isUnavailable = link.status !== "active" || Boolean(isExpired);
  const latestSubmission = link.submissions[0] ?? null;

  if (!isUnavailable) {
    await prisma.questionnaireLink.update({
      where: { id: link.id },
      data: {
        currentUses: {
          increment: 1,
        },
      },
    });
  }

  return (
    <IntakeFormContent
      token={token}
      template={template}
      initialAnswers={latestSubmission?.answers ?? {}}
      submissionStatus={latestSubmission?.status ?? "draft"}
      isUnavailable={isUnavailable}
      isSaved={query.saved === "1"}
      isSubmitted={query.submitted === "1"}
      error={query.error || ""}
      clientChineseName={link.case.client.chineseName || ""}
      clientEnglishName={link.case.client.englishName || ""}
      reference={link.case.reference}
      serviceType={getServiceTypeLabel(link.case.serviceType)}
      country={link.case.country}
      expiresAtText={
        link.expiresAt ? formatDateTime(link.expiresAt) : "No expiry"
      }
    />
  );
}
