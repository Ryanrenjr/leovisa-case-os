import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const DOCUMENSO_WEBHOOK_EVENTS = [
  "DOCUMENT_CREATED",
  "DOCUMENT_SENT",
  "DOCUMENT_OPENED",
  "DOCUMENT_SIGNED",
  "DOCUMENT_RECIPIENT_COMPLETED",
  "DOCUMENT_COMPLETED",
  "DOCUMENT_REJECTED",
  "DOCUMENT_CANCELLED",
  "DOCUMENT_REMINDER_SENT",
  "TEMPLATE_CREATED",
  "TEMPLATE_UPDATED",
  "TEMPLATE_DELETED",
  "TEMPLATE_USED",
] as const;

const recipientSchema = z.object({
  id: z.number(),
  email: z.string().optional().default(""),
  name: z.string().optional().default(""),
  signingStatus: z.string().optional().default(""),
  readStatus: z.string().optional().default(""),
  signedAt: z.string().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
});

const payloadSchema = z.object({
  id: z.number(),
  externalId: z.string().nullable().optional(),
  title: z.string().optional().default(""),
  status: z.string().optional().default(""),
  completedAt: z.string().nullable().optional(),
  recipients: z.array(recipientSchema).optional().default([]),
});

export const documensoWebhookSchema = z.object({
  event: z.enum(DOCUMENSO_WEBHOOK_EVENTS),
  payload: payloadSchema,
  createdAt: z.string().optional(),
  webhookEndpoint: z.string().optional(),
});

export type DocumensoWebhookEvent = z.infer<typeof documensoWebhookSchema>;

export function verifyDocumensoWebhookSecret(
  receivedSecret: string,
  expectedSecret: string
) {
  if (!expectedSecret) {
    return true;
  }

  if (!receivedSecret) {
    return false;
  }

  const receivedBuffer = Buffer.from(receivedSecret);
  const expectedBuffer = Buffer.from(expectedSecret);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}
