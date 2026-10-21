import assert from "node:assert/strict";
import test from "node:test";
import { getDashboardGroups, hasUsableDocument, needsPayment } from "./dashboard-groups";
import { getSubmissionReminder } from "./submission-reminder";

const row = {
  status: "under_review",
  submissionReminder: null,
  documents: { missingRequired: 2, pendingReview: 1 },
  invoices: { total: 0 },
  payments: { status: "unpaid" },
  visaExpiry: "-",
  submissionDate: "-",
  appointmentDate: "-",
};

test("material and finance tasks alone never enter priority alerts", () => {
  assert.deepEqual(getDashboardGroups(row), {
    priority: false, active: true, documents: true, finance: true, timeline: false, all: true,
  });
});

test("priority includes today through day 7 only, even if other tasks exist", () => {
  const now = new Date("2026-10-21T12:00:00Z");
  for (const [date, included] of [
    ["2026-10-20", false], ["2026-10-21", true], ["2026-10-22", true],
    ["2026-10-24", true], ["2026-10-28", true], ["2026-10-29", false],
  ] as const) {
    const submissionReminder = getSubmissionReminder(date, row.status, now);
    assert.equal(getDashboardGroups({ ...row, submissionReminder }).priority, included, date);
  }
});

test("closed cases stay in history but leave the active task groups", () => {
  for (const status of ["completed", "archived", "cancelled"]) {
    const groups = getDashboardGroups({
      ...row, status, submissionDate: "28 Oct 2026",
      submissionReminder: { daysRemaining: 7, level: "notice" },
    });
    assert.deepEqual(groups, {
      priority: false, active: false, documents: false, finance: false, timeline: true, all: true,
    });
  }
});

test("document delivery includes review-only cases and excludes finished material work", () => {
  assert.equal(getDashboardGroups({ ...row, documents: { missingRequired: 0, pendingReview: 1 } }).documents, true);
  assert.equal(getDashboardGroups({ ...row, documents: { missingRequired: 0, pendingReview: 0 } }).documents, false);
});

test("rejected and resubmission files don't satisfy checklist requirements", () => {
  assert.equal(hasUsableDocument([]), false);
  assert.equal(hasUsableDocument([{ reviewStatus: "rejected" }, { reviewStatus: "needs_resubmission" }]), false);
  assert.equal(hasUsableDocument([{ reviewStatus: "needs_resubmission" }, { reviewStatus: "uploaded" }]), true);
  assert.equal(hasUsableDocument([{ reviewStatus: "approved" }]), true);
});

test("overpaid, paid, and waived cases have no unpaid task when an invoice exists", () => {
  for (const status of ["paid", "waived", "overpaid"]) {
    assert.equal(needsPayment(status), false);
    assert.equal(getDashboardGroups({ ...row, invoices: { total: 1 }, payments: { status } }).finance, false);
  }
  assert.equal(getDashboardGroups({ ...row, payments: { status: "paid" } }).finance, true);
  assert.equal(needsPayment("partially_paid"), true);
});
