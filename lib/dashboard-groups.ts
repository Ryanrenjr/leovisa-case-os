import type { SubmissionReminder } from "./submission-reminder";

export const DASHBOARD_TABS = ["priority", "active", "documents", "finance", "timeline", "all"] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

export function isActiveCase(status: string) {
  return !["completed", "archived", "cancelled"].includes(status);
}

export function needsPayment(status: string) {
  return !["paid", "waived", "overpaid"].includes(status);
}

export function hasUsableDocument(documents: { reviewStatus: string }[]) {
  return documents.some(
    (document) => !["rejected", "needs_resubmission"].includes(document.reviewStatus)
  );
}

// Shared by the summary cards, tab counts, and list filters.
export function getDashboardGroups(row: {
  status: string;
  submissionReminder: SubmissionReminder | null;
  documents: { missingRequired: number; pendingReview: number };
  invoices: { total: number };
  payments: { status: string };
  visaExpiry: string;
  submissionDate: string;
  appointmentDate: string;
}) {
  const active = isActiveCase(row.status);
  return {
    priority: active && row.submissionReminder !== null &&
      row.submissionReminder.daysRemaining >= 0 && row.submissionReminder.daysRemaining <= 7,
    active,
    documents: active && (row.documents.missingRequired > 0 || row.documents.pendingReview > 0),
    finance: active && (row.invoices.total === 0 || needsPayment(row.payments.status)),
    timeline: row.visaExpiry !== "-" || row.submissionDate !== "-" || row.appointmentDate !== "-",
    all: true,
  };
}
