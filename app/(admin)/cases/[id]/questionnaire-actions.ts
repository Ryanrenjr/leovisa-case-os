"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import {
  getQuestionnaireTemplate,
  isQuestionnaireTemplate,
} from "../../../../lib/questionnaires/templates";
import { scopeQuestionnaireTemplateToPeople } from "../../../../lib/questionnaires/person-scoping";

function buildRedirect(caseId: string) {
  return `/cases/${caseId}?tab=forms#questionnaires-section`;
}

export async function generateQuestionnaireLink(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const templateKey = formData.get("templateKey")?.toString().trim() || "";
  const customTemplateText =
    formData.get("customTemplate")?.toString().trim() || "";

  if (!caseId || !templateKey) {
    throw new Error("Case ID and questionnaire template are required.");
  }

  const template = getQuestionnaireTemplate(templateKey);
  const baseCustomTemplate = customTemplateText
    ? JSON.parse(customTemplateText)
    : template;

  if (!template) {
    throw new Error("Questionnaire template not found.");
  }

  if (!isQuestionnaireTemplate(baseCustomTemplate)) {
    throw new Error("Questionnaire template is invalid.");
  }

  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      people: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          role: true,
          relationship: true,
          fullName: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!caseItem) {
    throw new Error("Case not found.");
  }

  const customTemplate = scopeQuestionnaireTemplateToPeople(
    baseCustomTemplate,
    caseItem.people
  );
  const customTemplateSnapshot = JSON.parse(JSON.stringify(customTemplate));

  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const link = await prisma.questionnaireLink.create({
    data: {
      caseId,
      token,
      templateKey,
      customTemplate: customTemplateSnapshot,
      status: "active",
      expiresAt,
    },
  });

  await prisma.auditLog.create({
    data: {
      caseId,
      relatedEntityType: "questionnaire_link",
      relatedEntityId: link.id,
      actionType: "generate_questionnaire_link",
      actorType: "user",
      success: true,
      newValue: {
        token: link.token,
        templateKey,
        templateTitle: customTemplate.titleZh,
        applicantCount: caseItem.people.length,
        expiresAt: link.expiresAt?.toISOString(),
      },
    },
  });

  redirect(buildRedirect(caseId));
}

export async function deactivateQuestionnaireLink(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const linkId = formData.get("linkId")?.toString().trim() || "";

  if (!caseId || !linkId) {
    throw new Error("Case ID and questionnaire link ID are required.");
  }

  const existingLink = await prisma.questionnaireLink.findUnique({
    where: { id: linkId },
    select: {
      id: true,
      caseId: true,
      token: true,
      status: true,
    },
  });

  if (!existingLink) {
    throw new Error("Questionnaire link not found.");
  }

  await prisma.questionnaireLink.update({
    where: { id: linkId },
    data: {
      status: "inactive",
    },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingLink.caseId,
      relatedEntityType: "questionnaire_link",
      relatedEntityId: existingLink.id,
      actionType: "deactivate_questionnaire_link",
      actorType: "user",
      success: true,
      oldValue: {
        status: existingLink.status,
      },
      newValue: {
        status: "inactive",
        token: existingLink.token,
      },
    },
  });

  redirect(buildRedirect(caseId));
}

export async function deleteQuestionnaireLink(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const linkId = formData.get("linkId")?.toString().trim() || "";

  if (!caseId || !linkId) {
    throw new Error("Case ID and questionnaire link ID are required.");
  }

  const existingLink = await prisma.questionnaireLink.findUnique({
    where: { id: linkId },
    include: {
      submissions: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!existingLink) {
    throw new Error("Questionnaire link not found.");
  }

  await prisma.$transaction([
    prisma.questionnaireSubmission.deleteMany({
      where: {
        linkId: existingLink.id,
      },
    }),
    prisma.questionnaireLink.delete({
      where: {
        id: existingLink.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        caseId: existingLink.caseId,
        relatedEntityType: "questionnaire_link",
        relatedEntityId: existingLink.id,
        actionType: "delete_questionnaire_link",
        actorType: "user",
        success: true,
        oldValue: {
          token: existingLink.token,
          templateKey: existingLink.templateKey,
          status: existingLink.status,
          submissionCount: existingLink.submissions.length,
          submissionStatuses: existingLink.submissions.map(
            (submission) => submission.status
          ),
        },
      },
    }),
  ]);

  redirect(buildRedirect(caseId));
}

export async function reopenQuestionnaireSubmission(formData: FormData) {
  const caseId = formData.get("caseId")?.toString().trim() || "";
  const submissionId = formData.get("submissionId")?.toString().trim() || "";

  if (!caseId || !submissionId) {
    throw new Error("Case ID and questionnaire submission ID are required.");
  }

  const existingSubmission = await prisma.questionnaireSubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      caseId: true,
      status: true,
    },
  });

  if (!existingSubmission) {
    throw new Error("Questionnaire submission not found.");
  }

  await prisma.questionnaireSubmission.update({
    where: { id: submissionId },
    data: {
      status: "draft",
      submittedAt: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      caseId: existingSubmission.caseId,
      relatedEntityType: "questionnaire_submission",
      relatedEntityId: existingSubmission.id,
      actionType: "reopen_questionnaire_submission",
      actorType: "user",
      success: true,
      oldValue: {
        status: existingSubmission.status,
      },
      newValue: {
        status: "draft",
      },
    },
  });

  redirect(buildRedirect(caseId));
}
