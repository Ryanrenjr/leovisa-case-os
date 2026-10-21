export type SubmissionReminder = {
  daysRemaining: number;
  level: "notice" | "warning" | "urgent";
};

const londonDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function calendarDay(date: Date) {
  const parts = londonDate.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  // Compare calendar dates rather than elapsed hours across DST changes.
  return Date.UTC(value("year"), value("month") - 1, value("day")) / 86_400_000;
}

export function getSubmissionReminder(
  submissionDate: Date | string | null | undefined,
  status: string,
  now: Date = new Date()
): SubmissionReminder | null {
  if (!submissionDate || ["completed", "archived", "cancelled"].includes(status)) {
    return null;
  }

  const date = new Date(submissionDate);
  if (Number.isNaN(date.getTime()) || Number.isNaN(now.getTime())) {
    return null;
  }

  const daysRemaining = calendarDay(date) - calendarDay(now);
  if (daysRemaining < 0 || daysRemaining > 7) {
    return null;
  }

  return {
    daysRemaining,
    level: daysRemaining <= 1 ? "urgent" : daysRemaining <= 3 ? "warning" : "notice",
  };
}

export function getSubmissionReminderText(
  reminder: SubmissionReminder,
  lang: "en" | "zh"
) {
  if (reminder.daysRemaining === 0) {
    return lang === "zh" ? "今天递签" : "Submission due today";
  }
  if (reminder.daysRemaining === 1) {
    return lang === "zh" ? "明天递签（剩余 1 天）" : "Submission due tomorrow (1 day left)";
  }
  return lang === "zh"
    ? `距递签还有 ${reminder.daysRemaining} 天`
    : `Submission in ${reminder.daysRemaining} days`;
}
