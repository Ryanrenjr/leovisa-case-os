import { createHash, timingSafeEqual } from "node:crypto";
import { getSubmissionReminder, getSubmissionReminderText } from "./submission-reminder";

export const REMINDER_FROM = "ryanrenjr824@gmail.com";
export const REMINDER_TO = "leovisaservice20@gmail.com";

export type ReminderCase = {
  id: string;
  caseCode: string;
  status: string;
  submissionDate: Date | null;
};

export function londonDateKey(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"].map((type) => parts.find((p) => p.type === type)!.value).join("-");
}

export function isReminderAuthorized(header: string | null, secret: string | undefined) {
  if (!secret || secret.length < 32 || !header) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]!);
}

export function buildReminderEmail(cases: ReminderCase[], appUrl: string, now = new Date()) {
  const origin = new URL(appUrl);
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password) {
    throw new Error("Invalid application URL");
  }
  const entries = cases.flatMap((item) => {
    const reminder = getSubmissionReminder(item.submissionDate, item.status, now);
    return reminder ? [{ item, reminder }] : [];
  }).sort((a, b) => a.reminder.daysRemaining - b.reminder.daysRemaining || a.item.caseCode.localeCompare(b.item.caseCode));
  if (!entries.length) return null;

  const lines = entries.map(({ item, reminder }) => {
    const date = londonDateKey(item.submissionDate!);
    const url = new URL(`/cases/${encodeURIComponent(item.id)}`, origin).href;
    const label = `${item.caseCode}：${getSubmissionReminderText(reminder, "zh")}（${date}）`;
    return { label, url };
  });
  return {
    count: entries.length,
    subject: `LeoVisa 递签提醒｜${londonDateKey(now)}｜${entries.length} 个案件`,
    text: `以下案件将在 7 天内递签，请及时检查准备进度。\n\n${lines.map(({ label, url }) => `${label}\n${url}`).join("\n\n")}\n\n日期按伦敦时区计算。请登录系统查看案件详情。`,
    html: `<h2>LeoVisa 递签提醒</h2><p>以下案件将在 7 天内递签，请及时检查准备进度。</p><ul>${lines.map(({ label, url }) => `<li><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></li>`).join("")}</ul><p>日期按伦敦时区计算。请登录系统查看案件详情。</p>`,
  };
}

type Digest = NonNullable<ReturnType<typeof buildReminderEmail>>;
export type ReminderDelivery = {
  alreadySent: (key: string) => Promise<boolean>;
  loadCases: () => Promise<ReminderCase[]>;
  send: (digest: Digest) => Promise<string>;
  recordSent: (key: string, count: number, messageId: string) => Promise<void>;
};

// The caller must hold the database lock until this operation commits.
export async function deliverReminder(deps: ReminderDelivery, appUrl: string, now = new Date()) {
  const key = `submission-reminder:${londonDateKey(now)}`;
  if (await deps.alreadySent(key)) return { status: "already_sent" } as const;
  const digest = buildReminderEmail(await deps.loadCases(), appUrl, now);
  if (!digest) return { status: "no_reminders" } as const;
  const messageId = await deps.send(digest);
  await deps.recordSent(key, digest.count, messageId);
  return { status: "sent", count: digest.count } as const;
}
