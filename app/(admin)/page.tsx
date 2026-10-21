export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";
import { getLangFromCookie, messages } from "../../lib/i18n";
import { getServiceTypeLabel } from "../../lib/service-options";
import DashboardProgressTable from "./DashboardProgressTable";
import { getSubmissionReminder } from "../../lib/submission-reminder";
import { DASHBOARD_TABS, getDashboardGroups, hasUsableDocument, isActiveCase, needsPayment } from "../../lib/dashboard-groups";
import type { DashboardTab } from "../../lib/dashboard-groups";
import { getReceivedPaymentTotals } from "../../lib/payment-options";

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    timeZone: "Europe/London",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "-";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function sumMoney(values: string[]) {
  return values.reduce((sum, value) => {
    const amount = Number(value);

    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
}

export default async function Home({ searchParams }: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const selectedTab: DashboardTab = DASHBOARD_TABS.includes(view as DashboardTab)
    ? view as DashboardTab : "priority";
  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);
  const t = messages[lang];

  const [clientsCount, cases] = await Promise.all([
    prisma.client.count(),
    prisma.case.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        client: true,
        assignedConsultant: true,
        checklistItems: {
          include: {
            documents: {
              select: {
                id: true,
                reviewStatus: true,
                isFinal: true,
                archiveFolder: true,
              },
            },
          },
        },
        documents: {
          select: {
            id: true,
            reviewStatus: true,
            isFinal: true,
            archiveFolder: true,
          },
        },
        questionnaireLinks: {
          include: {
            submissions: {
              select: {
                status: true,
              },
            },
          },
        },
        contracts: {
          select: {
            status: true,
          },
        },
        invoices: {
          select: {
            total: true,
            status: true,
          },
        },
        paymentRecords: {
          select: {
            amount: true,
            currency: true,
            status: true,
          },
        },
      },
    }),
  ]);

  const casesCount = cases.length;
  const activeCases = cases.filter((item) => isActiveCase(item.status));

  const now = new Date();
  const progressRows = cases.map((caseItem) => {
    const requiredChecklistItems = caseItem.checklistItems.filter(
      (item) => item.isRequired
    );
    const missingRequired = requiredChecklistItems.filter(
      (item) => !hasUsableDocument(item.documents)
    ).length;
    const uploadedChecklistItems = caseItem.checklistItems.filter(
      (item) => hasUsableDocument(item.documents)
    ).length;
    const pendingReview = caseItem.documents.filter(
      (document) => document.reviewStatus === "uploaded"
    ).length;
    const finalCount = caseItem.documents.filter(
      (document) => document.isFinal || document.archiveFolder === "final"
    ).length;
    const submittedForms = caseItem.questionnaireLinks.filter((link) =>
      link.submissions.some((submission) => submission.status === "submitted")
    ).length;
    const signedContracts = caseItem.contracts.filter(
      (contract) => contract.status === "signed"
    ).length;
    const invoiceAmount = sumMoney(
      caseItem.invoices.map((invoice) => invoice.total.toString())
    );
    const receivedPaymentTotals = getReceivedPaymentTotals(
      caseItem.paymentRecords.map((record) => ({ ...record, amount: record.amount.toString() }))
    );
    const risks: string[] = [];
    const submissionReminder = getSubmissionReminder(caseItem.submissionDate, caseItem.status, now);

    if (missingRequired > 0) {
      risks.push(
        lang === "zh"
          ? `缺 ${missingRequired} 项必传材料`
          : `${missingRequired} required missing`
      );
    }

    if (pendingReview > 0) {
      risks.push(
        lang === "zh"
          ? `${pendingReview} 个文件待审核`
          : `${pendingReview} files pending review`
      );
    }

    if (caseItem.contractStatus === "sent" && signedContracts === 0) {
      risks.push(lang === "zh" ? "合同待签署" : "Contract unsigned");
    }

    if (caseItem.questionnaireLinks.length > 0 && submittedForms === 0) {
      risks.push(lang === "zh" ? "申请表未提交" : "Form not submitted");
    }

    if (caseItem.invoices.length === 0) {
      risks.push(lang === "zh" ? "未生成 Invoice" : "No invoice");
    }

    if (
      needsPayment(caseItem.paymentStatus)
    ) {
      risks.push(lang === "zh" ? "付款未完成" : "Payment incomplete");
    }

    return {
      id: caseItem.id,
      reference: caseItem.reference,
      caseCode: caseItem.caseCode,
      clientName: caseItem.client.chineseName,
      englishName: caseItem.client.englishName,
      contact:
        caseItem.client.email ||
        caseItem.client.phone ||
        caseItem.client.wechat ||
        "",
      serviceType: getServiceTypeLabel(caseItem.serviceType),
      country: caseItem.country,
      status: caseItem.status,
      consultant: caseItem.assignedConsultant?.name ?? "-",
      openedAt: formatDate(caseItem.createdAt),
      visaExpiry: formatDate(caseItem.visaExpiryDate),
      submissionDate: formatDate(caseItem.submissionDate),
      submissionReminder,
      appointmentDate: formatDate(caseItem.appointmentDate),
      applicationCentre: caseItem.applicationCentre ?? "-",
      documents: {
        total: caseItem.checklistItems.length,
        uploaded: uploadedChecklistItems,
        missingRequired,
        pendingReview,
        finalCount,
      },
      forms: {
        links: caseItem.questionnaireLinks.length,
        submitted: submittedForms,
      },
      contracts: {
        total: caseItem.contracts.length,
        signed: signedContracts,
        status: caseItem.contractStatus,
      },
      invoices: {
        total: caseItem.invoices.length,
        amount: invoiceAmount > 0 ? formatMoney(String(invoiceAmount)) : "-",
      },
      payments: {
        status: caseItem.paymentStatus,
        totalReceived:
          receivedPaymentTotals.map((total) => new Intl.NumberFormat("en-GB", {
            style: "currency", currency: total.currency,
          }).format(total.amount)).join(" · ") || "-",
        records: caseItem.paymentRecords.length,
      },
      risks: isActiveCase(caseItem.status) ? risks : [],
      notes: caseItem.notes ?? "",
    };
  });

  const casesInProgressCount = activeCases.length;
  const documentCaseCount = progressRows.filter(
    (row) => getDashboardGroups(row).documents
  ).length;
  const pendingReviewCaseCount = progressRows.filter(
    (row) => isActiveCase(row.status) && row.documents.pendingReview > 0
  ).length;
  const noInvoiceCaseCount = progressRows.filter(
    (row) => isActiveCase(row.status) && row.invoices.total === 0
  ).length;
  const riskCaseCount = progressRows.filter((row) => getDashboardGroups(row).priority).length;
  const financeRiskCaseCount = progressRows.filter(
    (row) => getDashboardGroups(row).finance
  ).length;

  return (
    <main className="toss-page">
      <div className="toss-container">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="toss-title">
              {lang === "zh" ? "案件进度控制台" : t.dashboard.title}
            </h1>
            <p className="toss-subtitle">
              {lang === "zh"
                ? "先看关键状态，再进入下方工作台查看细节。"
                : "Start with the key status groups, then open the workspace for details."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/clients"
              className="toss-secondary-button px-5 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "客户" : "Clients"} · {clientsCount}
            </Link>
            <Link
              href="/cases"
              className="toss-primary-button px-5 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "查看全部案件" : "View All Cases"}
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/?view=active#case-workspace" className="toss-card block p-6 hover:-translate-y-[1px]">
            <p className="toss-label mb-3">{t.dashboard.casesInProgress}</p>
            <h2 className="toss-stat-number">{casesInProgressCount}</h2>
            <p className="mt-2 text-xs text-[#8b95a1]">
              {lang === "zh" ? "全部案件" : "All cases"}: {casesCount}
            </p>
          </Link>

          <Link href="/?view=priority#case-workspace" className="toss-card block p-6 hover:-translate-y-[1px]">
            <p className="toss-label mb-3">
              {lang === "zh" ? "重点提醒" : "Priority Alerts"}
            </p>
            <h2 className="toss-stat-number">{riskCaseCount}</h2>
            <p className="mt-2 text-xs text-[#8b95a1]">
              {lang === "zh" ? "未来 7 天内递签（含今天）" : "Submission within 7 days, including today"}
            </p>
          </Link>

          <Link href="/?view=documents#case-workspace" className="toss-card block p-6 hover:-translate-y-[1px]">
            <p className="toss-label mb-3">
              {lang === "zh" ? "材料交付" : "Document Delivery"}
            </p>
            <h2 className="toss-stat-number">{documentCaseCount}</h2>
            <p className="mt-2 text-xs text-[#8b95a1]">
              {pendingReviewCaseCount}{" "}
              {lang === "zh" ? "案待审核" : "with review queue"}
            </p>
          </Link>

          <Link href="/?view=finance#case-workspace" className="toss-card block p-6 hover:-translate-y-[1px]">
            <p className="toss-label mb-3">
              {lang === "zh" ? "收款开票" : "Finance"}
            </p>
            <h2 className="toss-stat-number">{financeRiskCaseCount}</h2>
            <p className="mt-2 text-xs text-[#8b95a1]">
              {noInvoiceCaseCount}{" "}
              {lang === "zh" ? "案未出 Invoice" : "without invoice"}
            </p>
          </Link>
        </div>

        <DashboardProgressTable key={selectedTab} rows={progressRows} lang={lang} initialTab={selectedTab} />
      </div>
    </main>
  );
}
