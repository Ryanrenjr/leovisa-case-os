import assert from "node:assert/strict";
import test from "node:test";
import { buildReminderEmail, deliverReminder, isReminderAuthorized, londonDateKey, type ReminderCase, type ReminderDelivery } from "./reminder-email";

const now = new Date("2026-10-22T08:00:00Z");
const caseItem = (days: number, status = "new", caseCode = "LVS-1"): ReminderCase => ({
  id: "case/1", caseCode, status, submissionDate: new Date(Date.UTC(2026, 9, 22 + days)),
});

test("digest includes only active cases due in 0–7 days and puts urgent cases first", () => {
  const digest = buildReminderEmail([
    caseItem(7, "new", "LVS-7"), caseItem(8), caseItem(-1),
    caseItem(1, "new", "LVS-1"), caseItem(0, "new", "LVS-0"),
    ...["completed", "cancelled", "archived"].map((status) => caseItem(1, status)),
    { ...caseItem(1), submissionDate: null },
  ], "https://example.com", now)!;
  assert.equal(digest.count, 3);
  assert.ok(digest.text.indexOf("LVS-0") < digest.text.indexOf("LVS-1"));
  assert.ok(digest.text.indexOf("LVS-1") < digest.text.indexOf("LVS-7"));
  assert.match(digest.text, /https:\/\/example.com\/cases\/case%2F1/);
  assert.equal(buildReminderEmail([caseItem(8)], "https://example.com", now), null);
});

test("escapes case data and rejects executable link protocols", () => {
  const digest = buildReminderEmail([caseItem(1, "new", '<img src=x onerror="alert(1)">')], "https://example.com", now)!;
  assert.ok(!digest.html.includes("<img"));
  assert.match(digest.html, /&lt;img/);
  assert.throws(() => buildReminderEmail([caseItem(1)], "javascript:alert(1)", now));
});

test("authorization fails closed for missing/short secrets and incorrect credentials", () => {
  const secret = "a".repeat(40);
  assert.equal(isReminderAuthorized(`Bearer ${secret}`, secret), true);
  assert.equal(isReminderAuthorized(null, secret), false);
  assert.equal(isReminderAuthorized("Bearer undefined", undefined), false);
  assert.equal(isReminderAuthorized("Bearer abc", "abc"), false);
  assert.equal(isReminderAuthorized(`Bearer ${secret}x`, secret), false);
});

test("daily keys follow London across midnight and DST", () => {
  assert.equal(londonDateKey(new Date("2026-07-21T23:30:00Z")), "2026-07-22");
  assert.equal(londonDateKey(new Date("2026-10-25T23:30:00Z")), "2026-10-25");
});

function fakeDelivery() {
  const sent = new Set<string>();
  let attempts = 0;
  const deps: ReminderDelivery = {
    alreadySent: async (key) => sent.has(key),
    loadCases: async () => [caseItem(1)],
    send: async () => { attempts++; return "message-id"; },
    recordSent: async (key) => { sent.add(key); },
  };
  return { deps, sent, attempts: () => attempts };
}

test("successful send is recorded and repeat invocation on the same day is skipped", async () => {
  const fake = fakeDelivery();
  assert.deepEqual(await deliverReminder(fake.deps, "https://example.com", now), { status: "sent", count: 1 });
  assert.deepEqual(await deliverReminder(fake.deps, "https://example.com", now), { status: "already_sent" });
  assert.equal(fake.attempts(), 1);
});

test("SMTP failure leaves no success record and permits a retry", async () => {
  const fake = fakeDelivery();
  const send = fake.deps.send;
  fake.deps.send = async () => { throw new Error("SMTP unavailable"); };
  await assert.rejects(deliverReminder(fake.deps, "https://example.com", now));
  assert.equal(fake.sent.size, 0);
  fake.deps.send = send;
  assert.equal((await deliverReminder(fake.deps, "https://example.com", now)).status, "sent");
});

test("empty days send nothing and allow a newly added reminder later that day", async () => {
  const fake = fakeDelivery();
  fake.deps.loadCases = async () => [];
  assert.equal((await deliverReminder(fake.deps, "https://example.com", now)).status, "no_reminders");
  assert.equal(fake.attempts(), 0);
  assert.equal(fake.sent.size, 0);
  fake.deps.loadCases = async () => [caseItem(1)];
  assert.equal((await deliverReminder(fake.deps, "https://example.com", now)).status, "sent");
});
