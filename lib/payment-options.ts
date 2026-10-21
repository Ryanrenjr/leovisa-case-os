export const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", zh: "未付款", en: "Unpaid" },
  { value: "deposit_paid", zh: "已付首款", en: "Deposit Paid" },
  { value: "partially_paid", zh: "部分付款", en: "Partially Paid" },
  { value: "paid", zh: "已付清", en: "Paid" },
  { value: "overpaid", zh: "多付", en: "Overpaid" },
  { value: "refunded", zh: "已退款", en: "Refunded" },
  { value: "waived", zh: "免收", en: "Waived" },
] as const;

export const PAYMENT_RECORD_STATUS_OPTIONS = PAYMENT_STATUS_OPTIONS;

const LEGACY_PAYMENT_RECORD_STATUS_OPTIONS = [
  { value: "received", zh: "已收款", en: "Received" },
  { value: "pending", zh: "待确认", en: "Pending" },
  { value: "refunded", zh: "已退款", en: "Refunded" },
  { value: "cancelled", zh: "已取消", en: "Cancelled" },
] as const;

export function getPaymentStatusLabel(value: string, lang: "en" | "zh") {
  const option = PAYMENT_STATUS_OPTIONS.find((item) => item.value === value);
  return option ? option[lang] : value || "-";
}

export function getPaymentRecordStatusLabel(value: string, lang: "en" | "zh") {
  const option = [...PAYMENT_RECORD_STATUS_OPTIONS, ...LEGACY_PAYMENT_RECORD_STATUS_OPTIONS].find(
    (item) => item.value === value
  );
  return option ? option[lang] : value || "-";
}

export function isPaymentStatus(value: string) {
  return PAYMENT_STATUS_OPTIONS.some((option) => option.value === value);
}

export function getReceivedPaymentTotals(records: {
  amount: string;
  currency: string;
  status: string;
}[]) {
  const centsByCurrency = new Map<string, number>();
  for (const record of records) {
    if (!["received", "deposit_paid", "partially_paid", "paid", "overpaid"].includes(record.status)) {
      continue;
    }
    const amount = Number(record.amount);
    if (!Number.isFinite(amount)) continue;
    const currency = record.currency.toUpperCase() || "GBP";
    centsByCurrency.set(currency, (centsByCurrency.get(currency) || 0) + Math.round(amount * 100));
  }
  return Array.from(centsByCurrency, ([currency, cents]) => ({ currency, amount: cents / 100 }));
}

export function getPaymentStatusAfterDeletion(
  currentStatus: string,
  deletedRecordId: string,
  records: { id: string; status: string; createdAt: Date }[]
) {
  const newestFirst = [...records].sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id)
  );
  const latest = newestFirst.find((record) => isPaymentStatus(record.status));
  // Preserve a later manual overview change or a newer payment record.
  if (latest?.id !== deletedRecordId || currentStatus !== latest.status) {
    return currentStatus;
  }
  const remaining = newestFirst.filter((record) => record.id !== deletedRecordId);
  return remaining.find((record) => isPaymentStatus(record.status))?.status
    // Legacy receipts don't tell us whether the full invoice has been paid.
    ?? (remaining.some((record) => record.status === "received") ? "partially_paid" : "unpaid");
}

export function getPaymentStatusTone(value: string) {
  if (value === "paid" || value === "waived") {
    return "border-[#bce8cf] bg-[#eefbf3] text-[#16794c]";
  }

  if (value === "deposit_paid" || value === "partially_paid") {
    return "border-[#ffdf9f] bg-[#fff7ed] text-[#b45309]";
  }

  if (value === "refunded" || value === "overpaid") {
    return "border-[#d9e5ff] bg-[#eef4ff] text-[#1b64da]";
  }

  return "border-[#ffd9de] bg-[#fff2f4] text-[#d92d3a]";
}
