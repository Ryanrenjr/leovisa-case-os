import assert from "node:assert/strict";
import test from "node:test";
import { getSubmissionReminder, getSubmissionReminderText } from "./submission-reminder";

test("shows continuous reminders throughout the 7/3/1-day windows and on the due date", () => {
  const now = new Date("2026-10-21T12:00:00Z");
  for (const [days, level] of [
    [7, "notice"], [6, "notice"], [4, "notice"],
    [3, "warning"], [2, "warning"], [1, "urgent"], [0, "urgent"],
  ] as const) {
    assert.deepEqual(
      getSubmissionReminder(`2026-10-${21 + days}T00:00:00Z`, "under_review", now),
      { daysRemaining: days, level }
    );
  }
  assert.equal(getSubmissionReminder("2026-10-29", "new", now), null);
  assert.equal(getSubmissionReminder("2026-10-20", "new", now), null);
});

test("ignores missing dates, invalid dates, and closed cases", () => {
  const now = new Date("2026-10-21T12:00:00Z");
  for (const date of [null, undefined, "", "invalid"]) {
    assert.equal(getSubmissionReminder(date, "new", now), null);
  }
  for (const status of ["completed", "archived", "cancelled"]) {
    assert.equal(getSubmissionReminder("2026-10-22", status, now), null);
  }
});

test("uses London's date when UTC is still on the previous day", () => {
  assert.deepEqual(
    getSubmissionReminder("2026-07-22T00:00:00Z", "signed", new Date("2026-07-21T23:30:00Z")),
    { daysRemaining: 0, level: "urgent" }
  );
});

test("counts calendar days across both daylight saving transitions", () => {
  assert.deepEqual(
    getSubmissionReminder("2026-03-30T00:00:00Z", "new", new Date("2026-03-28T23:30:00Z")),
    { daysRemaining: 2, level: "warning" }
  );
  assert.deepEqual(
    getSubmissionReminder("2026-10-26T00:00:00Z", "new", new Date("2026-10-24T23:30:00Z")),
    { daysRemaining: 1, level: "urgent" }
  );
});

test("recalculates after rescheduling or clearing the date", () => {
  const now = new Date("2026-10-21T12:00:00Z");
  assert.equal(getSubmissionReminder("2026-10-22", "new", now)?.daysRemaining, 1);
  assert.equal(getSubmissionReminder("2026-11-02", "new", now), null);
  assert.equal(getSubmissionReminder(null, "new", now), null);
});

test("provides Chinese and English labels for today, tomorrow, and upcoming dates", () => {
  assert.equal(getSubmissionReminderText({ daysRemaining: 0, level: "urgent" }, "zh"), "今天递签");
  assert.equal(getSubmissionReminderText({ daysRemaining: 1, level: "urgent" }, "en"), "Submission due tomorrow (1 day left)");
  assert.equal(getSubmissionReminderText({ daysRemaining: 3, level: "warning" }, "zh"), "距递签还有 3 天");
  assert.equal(getSubmissionReminderText({ daysRemaining: 7, level: "notice" }, "en"), "Submission in 7 days");
});
