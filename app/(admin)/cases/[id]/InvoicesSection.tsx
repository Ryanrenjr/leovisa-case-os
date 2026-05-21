"use client";

import { useState } from "react";
import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";
import { formatDateTime } from "../../../../lib/format-date";

type InvoiceItem = {
  id: string;
  invoiceRef: string;
  invoiceDate: Date;
  billTo: string;
  instructions: string;
  subtotal: unknown;
  total: unknown;
  templateName: string;
  versionNo: number;
  generatedBy: string | null;
  filePath: string | null;
  fileUrl: string | null;
  pdfPath: string | null;
  pdfUrl: string | null;
  status: string;
  generatedAt: Date;
};

type InvoicesSectionProps = {
  caseId: string;
  invoices: InvoiceItem[];
  onDeleteAction: (formData: FormData) => void;
  lang: "en" | "zh";
};

function formatMoney(value: unknown) {
  const amount =
    typeof value === "number"
      ? value
      : Number.parseFloat(value?.toString() ?? "0");

  if (!Number.isFinite(amount)) {
    return "\u00a30.00";
  }

  return `\u00a3${amount.toFixed(2)}`;
}

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString("en-GB");
}

export default function InvoicesSection({
  caseId,
  invoices,
  onDeleteAction,
  lang,
}: InvoicesSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = invoices.length > 3;
  const visibleInvoices = expanded ? invoices : invoices.slice(0, 3);

  return (
    <div id="invoices-section" className="toss-card mb-8 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
          {lang === "zh" ? "Invoices" : "Invoices"}
        </h2>
        <p className="text-sm font-medium text-[#8b95a1]">
          {invoices.length} {lang === "zh" ? "invoice(s)" : "invoice(s)"}
        </p>
      </div>

      {invoices.length === 0 ? (
        <p className="text-[15px] text-[#8b95a1]">
          {lang === "zh" ? "暂无 Invoice。" : "No invoices yet."}
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {visibleInvoices.map((invoice) => (
              <div key={invoice.id} className="toss-soft-card p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="toss-label mb-2">Invoice Ref</p>
                    <p className="break-all text-[16px] font-semibold text-[#191f28]">
                      {invoice.invoiceRef}
                    </p>
                  </div>

                  <div className="shrink-0 flex gap-2">
                    {invoice.filePath || invoice.fileUrl ? (
                      <a
                        href={`/cases/${caseId}/invoices/${invoice.id}/open`}
                        target="_blank"
                        rel="noreferrer"
                        className="toss-primary-button px-4 py-2 text-sm font-semibold"
                      >
                        {lang === "zh" ? "打开 Invoice" : "Open Invoice"}
                      </a>
                    ) : null}

                    {invoice.pdfPath || invoice.pdfUrl ? (
                      <a
                        href={`/cases/${caseId}/invoices/${invoice.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="toss-secondary-button px-4 py-2 text-sm font-semibold"
                      >
                        {lang === "zh" ? "打开 PDF" : "Open PDF"}
                      </a>
                    ) : null}

                    <form action={onDeleteAction}>
                      <input type="hidden" name="caseId" value={caseId} />
                      <input type="hidden" name="invoiceId" value={invoice.id} />
                      <ConfirmSubmitButton
                        label={lang === "zh" ? "删除 Invoice" : "Delete Invoice"}
                        confirmMessage={
                          lang === "zh"
                            ? "确认要删除这份 Invoice 吗？"
                            : "Are you sure you want to delete this invoice?"
                        }
                        className="toss-danger-button px-4 py-2 text-sm font-semibold"
                      />
                    </form>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="toss-label mb-2">Bill To</p>
                    <p className="text-[15px] text-[#4e5968]">{invoice.billTo}</p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">Invoice Date</p>
                    <p className="text-[15px] text-[#4e5968]">
                      {formatDate(invoice.invoiceDate)}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">Instructions</p>
                    <p className="text-[15px] text-[#4e5968]">
                      {invoice.instructions}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">Total</p>
                    <p className="text-[15px] font-semibold text-[#191f28]">
                      {formatMoney(invoice.total)}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">Generated At</p>
                    <p className="text-[15px] text-[#4e5968]">
                      {formatDateTime(invoice.generatedAt)}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">Generated By</p>
                    <p className="text-[15px] text-[#4e5968]">
                      {invoice.generatedBy ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="toss-secondary-button px-4 py-2 text-sm font-semibold"
              >
                {expanded
                  ? lang === "zh"
                    ? "收起"
                    : "Show Less"
                  : lang === "zh"
                  ? `显示更多 (${invoices.length - 3})`
                  : `Show More (${invoices.length - 3})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
