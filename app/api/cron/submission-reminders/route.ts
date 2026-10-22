import { prisma } from "../../../../lib/prisma";
import { createGmailTransport } from "../../../../lib/gmail";
import {
  deliverReminder, isReminderAuthorized, REMINDER_FROM, REMINDER_TO,
} from "../../../../lib/reminder-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isReminderAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl || !process.env.GMAIL_APP_PASSWORD) {
    return Response.json({ error: "Email reminders are not configured" }, { status: 503 });
  }
  try {
    const transport = createGmailTransport();
    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      // PostgreSQL transaction lock prevents overlapping cron/manual invocations.
      const [lock] = await tx.$queryRaw<{ acquired: boolean }[]>`
        SELECT pg_try_advisory_xact_lock(173204, 1) AS acquired
      `;
      if (!lock.acquired) return { status: "busy" };
      return deliverReminder({
        alreadySent: async (id) => Boolean(await tx.auditLog.findUnique({ where: { id } })),
        loadCases: () => tx.case.findMany({
          where: {
            status: { notIn: ["completed", "archived", "cancelled"] },
            submissionDate: {
              gte: new Date(now.getTime() - 2 * 86_400_000),
              lte: new Date(now.getTime() + 9 * 86_400_000),
            },
          },
          select: { id: true, caseCode: true, status: true, submissionDate: true },
        }),
        send: async (digest) => {
          const info = await transport.sendMail({
            from: { name: "LeoVisa 案件提醒", address: REMINDER_FROM },
            to: REMINDER_TO,
            subject: digest.subject,
            text: digest.text,
            html: digest.html,
            disableFileAccess: true,
            disableUrlAccess: true,
          });
          if (!info.accepted.includes(REMINDER_TO)) throw new Error("Recipient not accepted");
          return info.messageId;
        },
        recordSent: async (id, count, messageId) => {
          await tx.auditLog.create({ data: {
            id, relatedEntityType: "submission_reminder", actionType: "email_sent",
            actorType: "system", success: true,
            metadata: { from: REMINDER_FROM, to: REMINDER_TO, count, messageId },
          } });
        },
      }, appUrl, now);
    }, { maxWait: 5_000, timeout: 50_000 });
    return Response.json(result);
  } catch {
    // SMTP errors may contain credentials or message content; do not log them.
    console.error("Submission reminder email failed; check SMTP configuration and database availability.");
    return Response.json({ error: "Reminder delivery failed" }, { status: 503 });
  }
}
