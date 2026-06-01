"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import {
  getPaymentStatusLabel,
  getPaymentStatusTone,
} from "../../lib/payment-options";

type ProgressRow = {
  id: string;
  reference: string;
  caseCode: string;
  clientName: string;
  englishName: string;
  contact: string;
  serviceType: string;
  country: string;
  status: string;
  consultant: string;
  openedAt: string;
  visaExpiry: string;
  submissionDate: string;
  appointmentDate: string;
  applicationCentre: string;
  documents: {
    total: number;
    uploaded: number;
    missingRequired: number;
    pendingReview: number;
    finalCount: number;
  };
  forms: {
    links: number;
    submitted: number;
  };
  contracts: {
    total: number;
    signed: number;
    status: string;
  };
  invoices: {
    total: number;
    amount: string;
  };
  payments: {
    status: string;
    totalReceived: string;
    records: number;
  };
  risks: string[];
  notes: string;
};

type DashboardProgressTableProps = {
  rows: ProgressRow[];
  lang: "en" | "zh";
};

const PAGE_SIZE = 5;

const tabs = [
  { id: "priority", zh: "重点提醒", en: "Priority" },
  { id: "documents", zh: "材料交付", en: "Documents" },
  { id: "finance", zh: "收款开票", en: "Finance" },
  { id: "timeline", zh: "时间节点", en: "Timeline" },
  { id: "all", zh: "全部案件", en: "All Cases" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function shortName(row: ProgressRow) {
  return row.clientName || row.englishName || "-";
}

function progressText(done: number, total: number) {
  if (total === 0) {
    return "-";
  }

  return `${done}/${total}`;
}

function progressTone(done: number, total: number, danger = false) {
  if (danger) {
    return "bg-[#fff2f4] text-[#d92d3a]";
  }

  if (total === 0) {
    return "bg-[#f2f4f6] text-[#8b95a1]";
  }

  if (done >= total) {
    return "bg-[#ecfdf3] text-[#16794c]";
  }

  return "bg-[#fff7ed] text-[#b45309]";
}

function getPrimaryLine(row: ProgressRow, lang: "en" | "zh") {
  if (row.risks.length > 0) {
    return row.risks.slice(0, 2).join(" · ");
  }

  if (row.status === "completed") {
    return lang === "zh" ? "已完成" : "Completed";
  }

  return lang === "zh" ? "暂无高优先级提醒" : "No high priority alert";
}

export default function DashboardProgressTable({
  rows,
  lang,
}: DashboardProgressTableProps) {
  const [activeTab, setActiveTab] = useState<TabId>("priority");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const tabCounts = useMemo(
    () => ({
      priority: rows.filter((row) => row.risks.length > 0).length,
      documents: rows.filter(
        (row) =>
          row.documents.missingRequired > 0 || row.documents.pendingReview > 0
      ).length,
      finance: rows.filter(
        (row) =>
          row.invoices.total === 0 ||
          (row.payments.status !== "paid" && row.payments.status !== "waived")
      ).length,
      timeline: rows.filter(
        (row) =>
          row.visaExpiry !== "-" ||
          row.submissionDate !== "-" ||
          row.appointmentDate !== "-"
      ).length,
      all: rows.length,
    }),
    [rows]
  );

  const visibleRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !keyword ||
        [
          row.reference,
          row.caseCode,
          row.clientName,
          row.englishName,
          row.serviceType,
          row.country,
          row.consultant,
          row.contact,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword));

      if (!matchesQuery) {
        return false;
      }

      if (activeTab === "priority") {
        return row.risks.length > 0;
      }

      if (activeTab === "documents") {
        return row.documents.missingRequired > 0 || row.documents.pendingReview > 0;
      }

      if (activeTab === "finance") {
        return (
          row.invoices.total === 0 ||
          (row.payments.status !== "paid" && row.payments.status !== "waived")
        );
      }

      if (activeTab === "timeline") {
        return (
          row.visaExpiry !== "-" ||
          row.submissionDate !== "-" ||
          row.appointmentDate !== "-"
        );
      }

      return true;
    });
  }, [activeTab, query, rows]);

  const pageCount = Math.max(1, Math.ceil(visibleRows.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const pageRows = visibleRows.slice(pageStart, pageStart + PAGE_SIZE);
  const resultStart = visibleRows.length === 0 ? 0 : pageStart + 1;
  const resultEnd = Math.min(pageStart + PAGE_SIZE, visibleRows.length);

  function resetList() {
    setCurrentPage(1);
    setExpandedId(null);
  }

  return (
    <section className="toss-card p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#191f28]">
            {lang === "zh" ? "案件工作台" : "Case Workspace"}
          </h2>
          <p className="mt-2 text-sm text-[#6b7684]">
            {lang === "zh"
              ? "先看重要分类，需要时再展开案件细节。"
              : "Scan the key groups first, then expand a case for detail."}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[420px]">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetList();
            }}
            placeholder={
              lang === "zh"
                ? "搜索案件号、客户、业务、顾问"
                : "Search case, client, service, consultant"
            }
            className="w-full px-4 py-3 text-sm"
          />
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto rounded-[20px] border border-[#eef1f4] bg-[#f8fafc] p-2">
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                resetList();
              }}
              className={`flex min-h-[46px] shrink-0 items-center gap-3 rounded-2xl px-4 py-2 text-sm font-bold transition ${
                selected
                  ? "bg-[#3182f6] text-white shadow-[0_8px_20px_rgba(49,130,246,0.20)]"
                  : "bg-white text-[#4e5968] hover:bg-[#f8fafc]"
              }`}
            >
              <span>{lang === "zh" ? tab.zh : tab.en}</span>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  selected ? "bg-white/20 text-white" : "bg-[#f2f4f6] text-[#8b95a1]"
                }`}
              >
                {tabCounts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {pageRows.map((row) => {
          const expanded = expandedId === row.id;

          return (
            <article
              key={row.id}
              className="rounded-2xl border border-[#eef1f4] bg-white p-4"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/cases/${row.id}`}
                      className="font-bold text-[#1b64da]"
                    >
                      {row.reference}
                    </Link>
                    <StatusBadge value={row.status} lang={lang} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#191f28]">
                    {shortName(row)}
                    <span className="font-normal text-[#8b95a1]">
                      {" "}
                      · {row.serviceType}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-[#6b7684]">
                    {getPrimaryLine(row, lang)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4 xl:min-w-[520px]">
                  <Link
                    href={`/cases/${row.id}?tab=documents#documents-section`}
                    className={`rounded-2xl px-3 py-2 font-bold ${progressTone(
                      row.documents.uploaded,
                      row.documents.total,
                      row.documents.missingRequired > 0
                    )}`}
                  >
                    <span className="block text-[11px] font-semibold opacity-75">
                      {lang === "zh" ? "材料" : "Docs"}
                    </span>
                    {progressText(row.documents.uploaded, row.documents.total)}
                  </Link>
                  <Link
                    href={`/cases/${row.id}?tab=forms#questionnaires-section`}
                    className={`rounded-2xl px-3 py-2 font-bold ${progressTone(
                      row.forms.submitted,
                      row.forms.links
                    )}`}
                  >
                    <span className="block text-[11px] font-semibold opacity-75">
                      {lang === "zh" ? "表单" : "Forms"}
                    </span>
                    {progressText(row.forms.submitted, row.forms.links)}
                  </Link>
                  <Link
                    href={`/cases/${row.id}?tab=invoices#invoices-section`}
                    className={`rounded-2xl px-3 py-2 font-bold ${
                      row.invoices.total > 0
                        ? "bg-[#ecfdf3] text-[#16794c]"
                        : "bg-[#fff7ed] text-[#b45309]"
                    }`}
                  >
                    <span className="block text-[11px] font-semibold opacity-75">
                      Invoice
                    </span>
                    {row.invoices.total}
                  </Link>
                  <Link
                    href={`/cases/${row.id}?tab=invoices#payment-records-section`}
                    className={`rounded-2xl border px-3 py-2 font-bold ${getPaymentStatusTone(
                      row.payments.status
                    )}`}
                  >
                    <span className="block text-[11px] font-semibold opacity-75">
                      {lang === "zh" ? "付款" : "Pay"}
                    </span>
                    {getPaymentStatusLabel(row.payments.status, lang)}
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : row.id)}
                  className="toss-secondary-button min-h-[44px] px-4 text-sm font-semibold xl:self-stretch"
                >
                  {expanded
                    ? lang === "zh"
                      ? "收起"
                      : "Hide"
                    : lang === "zh"
                      ? "细节"
                      : "Details"}
                </button>
              </div>

              {expanded ? (
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#eef1f4] pt-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-[#f8fafc] p-4">
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "材料" : "Documents"}
                    </p>
                    <p className="text-sm text-[#4e5968]">
                      {lang === "zh" ? "缺必传" : "Missing required"}:{" "}
                      {row.documents.missingRequired}
                    </p>
                    <p className="mt-1 text-sm text-[#4e5968]">
                      {lang === "zh" ? "待审核" : "Pending review"}:{" "}
                      {row.documents.pendingReview}
                    </p>
                    <p className="mt-1 text-sm text-[#4e5968]">
                      {lang === "zh" ? "最终版" : "Final"}:{" "}
                      {row.documents.finalCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f8fafc] p-4">
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "合同 / 表单" : "Contract / Forms"}
                    </p>
                    <p className="text-sm text-[#4e5968]">
                      {lang === "zh" ? "合同" : "Contracts"}:{" "}
                      {row.contracts.signed}/{row.contracts.total}
                    </p>
                    <p className="mt-1 text-sm text-[#4e5968]">
                      {lang === "zh" ? "合同状态" : "Contract status"}:{" "}
                      {row.contracts.status}
                    </p>
                    <p className="mt-1 text-sm text-[#4e5968]">
                      {lang === "zh" ? "表单" : "Forms"}:{" "}
                      {row.forms.submitted}/{row.forms.links}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f8fafc] p-4">
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "收款开票" : "Finance"}
                    </p>
                    <p className="text-sm text-[#4e5968]">
                      Invoice: {row.invoices.total} · {row.invoices.amount}
                    </p>
                    <p className="mt-1 text-sm text-[#4e5968]">
                      {lang === "zh" ? "已收" : "Received"}:{" "}
                      {row.payments.totalReceived}
                    </p>
                    <p className="mt-1 text-sm text-[#4e5968]">
                      {lang === "zh" ? "记录" : "Records"}: {row.payments.records}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f8fafc] p-4">
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "时间节点" : "Timeline"}
                    </p>
                    <p className="text-sm text-[#4e5968]">
                      {lang === "zh" ? "签证到期" : "Visa expiry"}:{" "}
                      {row.visaExpiry}
                    </p>
                    <p className="mt-1 text-sm text-[#4e5968]">
                      {lang === "zh" ? "递交" : "Submission"}:{" "}
                      {row.submissionDate}
                    </p>
                    <p className="mt-1 text-sm text-[#4e5968]">
                      {lang === "zh" ? "预约" : "Appointment"}:{" "}
                      {row.appointmentDate}
                    </p>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}

        {visibleRows.length === 0 ? (
          <div className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-8 text-center text-sm font-semibold text-[#8b95a1]">
            {lang === "zh" ? "没有符合条件的案件。" : "No matching cases."}
          </div>
        ) : null}
      </div>

      {visibleRows.length > 0 ? (
        <div className="mt-5 flex flex-col gap-3 border-t border-[#eef1f4] pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold text-[#6b7684]">
            {lang === "zh"
              ? `显示 ${resultStart}-${resultEnd} / ${visibleRows.length} 个案件`
              : `Showing ${resultStart}-${resultEnd} of ${visibleRows.length} cases`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCurrentPage((page) => Math.max(1, page - 1));
                setExpandedId(null);
              }}
              disabled={safeCurrentPage === 1}
              className="toss-secondary-button min-h-[42px] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
            >
              {lang === "zh" ? "上一页" : "Previous"}
            </button>
            <span className="min-w-[92px] text-center text-sm font-bold text-[#4e5968]">
              {safeCurrentPage} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => {
                setCurrentPage((page) => Math.min(pageCount, page + 1));
                setExpandedId(null);
              }}
              disabled={safeCurrentPage === pageCount}
              className="toss-secondary-button min-h-[42px] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
            >
              {lang === "zh" ? "下一页" : "Next"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
