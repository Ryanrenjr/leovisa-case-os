"use client";

import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";
import { formatDateTime } from "../../../../lib/format-date";
import {
  PAYMENT_RECORD_STATUS_OPTIONS,
  getPaymentRecordStatusLabel,
} from "../../../../lib/payment-options";

type PaymentRecord = {
  id: string;
  label: string | null;
  amount: string;
  currency: string;
  paymentDate: Date | null;
  method: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
};

type PaymentRecordsSectionProps = {
  caseId: string;
  paymentRecords: PaymentRecord[];
  onCreateAction: (formData: FormData) => void;
  onDeleteAction: (formData: FormData) => void;
  lang: "en" | "zh";
};

function formatMoney(value: string, currency: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "-";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
  }).format(amount);
}

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-GB");
}

export default function PaymentRecordsSection({
  caseId,
  paymentRecords,
  onCreateAction,
  onDeleteAction,
  lang,
}: PaymentRecordsSectionProps) {
  const totalReceived = paymentRecords
    .filter((record) => record.status === "received")
    .reduce((sum, record) => sum + Number(record.amount), 0);

  return (
    <div id="payment-records-section" className="toss-card mb-8 p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
            {lang === "zh" ? "付款记录" : "Payment Records"}
          </h2>
          <p className="mt-2 text-sm font-medium text-[#8b95a1]">
            {lang === "zh" ? "记录首款、尾款、退款或待确认收款。" : "Track deposits, balances, refunds, and pending payments."}
          </p>
        </div>

        <div className="rounded-2xl border border-[#d7f0df] bg-[#eefbf3] px-4 py-3 text-right">
          <p className="text-xs font-bold uppercase text-[#16794c]">
            {lang === "zh" ? "已确认收款" : "Received"}
          </p>
          <p className="mt-1 text-[22px] font-extrabold text-[#16794c]">
            {formatMoney(String(totalReceived), "GBP")}
          </p>
        </div>
      </div>

      <form action={onCreateAction} className="mb-6 rounded-[24px] border border-[#eef1f4] bg-[#fafbfc] p-5">
        <input type="hidden" name="caseId" value={caseId} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="toss-label mb-2 block">
              {lang === "zh" ? "款项名称" : "Label"}
            </label>
            <input
              name="label"
              className="w-full px-4 py-3"
              placeholder={lang === "zh" ? "例如：首款 / 尾款" : "Deposit / balance"}
            />
          </div>

          <div>
            <label className="toss-label mb-2 block">
              {lang === "zh" ? "金额" : "Amount"}
            </label>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              required
              className="w-full px-4 py-3"
            />
          </div>

          <div>
            <label className="toss-label mb-2 block">
              {lang === "zh" ? "币种" : "Currency"}
            </label>
            <input
              name="currency"
              defaultValue="GBP"
              className="w-full px-4 py-3"
            />
          </div>

          <div>
            <label className="toss-label mb-2 block">
              {lang === "zh" ? "付款日期" : "Date"}
            </label>
            <input name="paymentDate" type="date" className="w-full px-4 py-3" />
          </div>

          <div>
            <label className="toss-label mb-2 block">
              {lang === "zh" ? "状态" : "Status"}
            </label>
            <select name="status" defaultValue="received" className="w-full px-4 py-3">
              {PAYMENT_RECORD_STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {lang === "zh" ? item.zh : item.en}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="toss-label mb-2 block">
              {lang === "zh" ? "付款方式" : "Method"}
            </label>
            <input
              name="method"
              className="w-full px-4 py-3"
              placeholder={lang === "zh" ? "银行转账 / 现金 / Stripe" : "Bank transfer / cash / Stripe"}
            />
          </div>

          <div className="md:col-span-3">
            <label className="toss-label mb-2 block">
              {lang === "zh" ? "备注" : "Notes"}
            </label>
            <input name="notes" className="w-full px-4 py-3" />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="toss-primary-button w-full px-4 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "添加付款" : "Add Payment"}
            </button>
          </div>
        </div>
      </form>

      {paymentRecords.length === 0 ? (
        <p className="text-[15px] text-[#8b95a1]">
          {lang === "zh" ? "暂无付款记录。" : "No payment records yet."}
        </p>
      ) : (
        <div className="space-y-3">
          {paymentRecords.map((record) => (
            <div
              key={record.id}
              className="rounded-[24px] border border-[#eef1f4] bg-white p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[18px] font-bold text-[#191f28]">
                    {record.label || (lang === "zh" ? "付款" : "Payment")}
                  </p>
                  <p className="mt-2 text-[15px] font-semibold text-[#16794c]">
                    {formatMoney(record.amount, record.currency)}
                  </p>
                </div>

                <form action={onDeleteAction}>
                  <input type="hidden" name="caseId" value={caseId} />
                  <input type="hidden" name="paymentRecordId" value={record.id} />
                  <ConfirmSubmitButton
                    label={lang === "zh" ? "删除" : "Delete"}
                    confirmMessage={
                      lang === "zh"
                        ? "确认删除这条付款记录吗？"
                        : "Delete this payment record?"
                    }
                    className="toss-danger-button px-4 py-2 text-sm font-semibold"
                  />
                </form>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                <div>
                  <p className="toss-label mb-2">{lang === "zh" ? "状态" : "Status"}</p>
                  <p className="text-[15px] text-[#333d4b]">
                    {getPaymentRecordStatusLabel(record.status, lang)}
                  </p>
                </div>
                <div>
                  <p className="toss-label mb-2">{lang === "zh" ? "付款日期" : "Payment Date"}</p>
                  <p className="text-[15px] text-[#333d4b]">
                    {formatDate(record.paymentDate)}
                  </p>
                </div>
                <div>
                  <p className="toss-label mb-2">{lang === "zh" ? "付款方式" : "Method"}</p>
                  <p className="text-[15px] text-[#333d4b]">
                    {record.method || "-"}
                  </p>
                </div>
                <div>
                  <p className="toss-label mb-2">{lang === "zh" ? "创建时间" : "Created"}</p>
                  <p className="text-[15px] text-[#333d4b]">
                    {formatDateTime(record.createdAt)}
                  </p>
                </div>
              </div>

              {record.notes ? (
                <p className="mt-4 text-[15px] leading-7 text-[#4e5968]">
                  {record.notes}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
