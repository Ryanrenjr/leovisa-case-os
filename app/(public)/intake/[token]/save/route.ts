import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getQuestionnaireTemplate } from "../../../../../lib/questionnaires/templates";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

function isPlainObject(value: unknown) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const body = await request.json().catch(() => null);
  const action = body?.action === "submit" ? "submit" : "draft";
  const answers = isPlainObject(body?.answers) ? body.answers : {};

  if (!token) {
    return NextResponse.json({ error: "link_unavailable" }, { status: 404 });
  }

  const link = await prisma.questionnaireLink.findUnique({
    where: { token },
    include: {
      submissions: {
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!link) {
    return NextResponse.json({ error: "link_unavailable" }, { status: 404 });
  }

  const template = getQuestionnaireTemplate(link.templateKey);
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();

  if (!template || link.status !== "active" || isExpired) {
    return NextResponse.json({ error: "link_unavailable" }, { status: 403 });
  }

  const existingSubmission = link.submissions[0] ?? null;

  if (existingSubmission?.status === "submitted") {
    return NextResponse.json({ error: "already_submitted" }, { status: 409 });
  }

  const submittedAt = action === "submit" ? new Date() : null;

  const submission = existingSubmission
    ? await prisma.questionnaireSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          answers,
          status: action === "submit" ? "submitted" : "draft",
          submittedAt,
        },
      })
    : await prisma.questionnaireSubmission.create({
        data: {
          caseId: link.caseId,
          linkId: link.id,
          templateKey: link.templateKey,
          answers,
          status: action === "submit" ? "submitted" : "draft",
          submittedAt,
        },
      });

  if (action === "submit") {
    await prisma.$transaction([
      prisma.case.update({
        where: { id: link.caseId },
        data: {
          intakeStatus: "received",
        },
      }),
      prisma.auditLog.create({
        data: {
          caseId: link.caseId,
          relatedEntityType: "questionnaire_submission",
          relatedEntityId: submission.id,
          actionType: "submit_questionnaire",
          actorType: "client",
          success: true,
          newValue: {
            templateKey: link.templateKey,
            templateTitle: template.titleZh,
            status: "submitted",
          },
        },
      }),
    ]);
  }

  return NextResponse.json({
    success: true,
    submissionId: submission.id,
    status: submission.status,
  });
}
