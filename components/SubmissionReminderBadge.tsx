import {
  getSubmissionReminderText,
  type SubmissionReminder,
} from "../lib/submission-reminder";

const tones = {
  notice: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
  warning: "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]",
  urgent: "border-[#ffd9de] bg-[#fff2f4] text-[#b42332]",
};

export default function SubmissionReminderBadge({
  reminder,
  lang,
}: {
  reminder: SubmissionReminder;
  lang: "en" | "zh";
}) {
  return (
    <span className={`inline-flex rounded-xl border px-3 py-2 text-sm font-bold ${tones[reminder.level]}`}>
      {getSubmissionReminderText(reminder, lang)}
    </span>
  );
}
