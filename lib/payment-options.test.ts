import assert from "node:assert/strict";
import test from "node:test";
import {
  PAYMENT_RECORD_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS, getPaymentRecordStatusLabel,
  getPaymentStatusAfterDeletion, getReceivedPaymentTotals, isPaymentStatus,
} from "./payment-options";

const deposit = { id: "deposit", status: "deposit_paid", createdAt: new Date("2026-10-20T10:00:00Z") };
const balance = { id: "balance", status: "paid", createdAt: new Date("2026-10-21T10:00:00Z") };

test("new payment records use exactly the overview status choices, while old labels stay readable", () => {
  assert.equal(PAYMENT_RECORD_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS);
  assert.equal(getPaymentRecordStatusLabel("deposit_paid", "zh"), "已付首款");
  assert.equal(getPaymentRecordStatusLabel("received", "zh"), "已收款");
  assert.equal(getPaymentRecordStatusLabel("pending", "en"), "Pending");
  assert.equal(getPaymentRecordStatusLabel("cancelled", "zh"), "已取消");
  assert.equal(isPaymentStatus("received"), false);
  assert.equal(isPaymentStatus("unknown"), false);
});

test("receipt totals include both old receipts and new paid stages, excluding unpaid, waived and refund records", () => {
  const records = ["received", "deposit_paid", "partially_paid", "paid", "overpaid",
    "unpaid", "waived", "refunded", "pending", "cancelled"]
    .map((status) => ({ status, amount: "100.10", currency: "GBP" }));
  assert.deepEqual(getReceivedPaymentTotals(records), [{ currency: "GBP", amount: 500.50 }]);
});

test("receipt totals preserve pence and keep different currencies separate", () => {
  assert.deepEqual(getReceivedPaymentTotals([
    { status: "deposit_paid", amount: "0.10", currency: "gbp" },
    { status: "paid", amount: "0.20", currency: "GBP" },
    { status: "received", amount: "20.15", currency: "EUR" },
  ]), [{ currency: "GBP", amount: 0.30 }, { currency: "EUR", amount: 20.15 }]);
});

test("deleting the newest paid record restores the previous deposit status", () => {
  assert.equal(getPaymentStatusAfterDeletion("paid", balance.id, [deposit, balance]), "deposit_paid");
});

test("deleting an older record or a legacy receipt preserves the latest overview status", () => {
  assert.equal(getPaymentStatusAfterDeletion("paid", deposit.id, [deposit, balance]), "paid");
  const legacy = { ...balance, id: "legacy", status: "received" };
  assert.equal(getPaymentStatusAfterDeletion("paid", legacy.id, [deposit, legacy]), "paid");
});

test("deleting a record preserves a subsequent manual overview change", () => {
  assert.equal(getPaymentStatusAfterDeletion("waived", balance.id, [deposit, balance]), "waived");
});

test("deleting the last status record falls back safely without assuming a legacy receipt is full payment", () => {
  assert.equal(getPaymentStatusAfterDeletion("paid", balance.id, [balance]), "unpaid");
  const legacy = { ...deposit, id: "legacy", status: "received" };
  assert.equal(getPaymentStatusAfterDeletion("paid", balance.id, [legacy, balance]), "partially_paid");
});
