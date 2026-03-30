import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { getLangFromCookie, messages } from "../../../../lib/i18n";
import { updateCaseStatus, deleteCase } from "./actions";
import { generateUploadLink } from "./upload-actions";
import {
  deactivateUploadLink,
  deleteUploadLink,
} from "./upload-link-actions";
import {
  deleteDocument,
  updateDocumentReviewStatus,
  updateDocumentDisplayName,
} from "./document-actions";
import DocumentsSection from "./DocumentsSection";
import UploadLinksSection from "./UploadLinksSection";
import SubmissionsSection from "./SubmissionsSection";
import ContractsSection from "./ContractsSection";
import AuditLogsSection from "./AuditLogsSection";
import StatusBadge from "../../../../components/StatusBadge";
import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";
import { deleteSubmission } from "./submission-actions";
import { deleteContract } from "./contract-actions";
import {
  CASE_STATUS_OPTIONS,
  CONTRACT_STATUS_OPTIONS,
  INTAKE_STATUS_OPTIONS,
} from "../../../../lib/status-options";
import {
  deleteAuditLog,
  deleteSelectedAuditLogs,
} from "./audit-log-actions";

type CaseDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    deleteError?: string;
  }>;
};

export default async function CaseDetailPage({
  params,
  searchParams,
}: CaseDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const deleteError = query.deleteError || "";

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);
  const t = messages[lang];

  const caseItem = await prisma.case.findUnique({
    where: { id },
    include: {
      client: true,
      assignedConsultant: true,
      documents: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          submission: true,
        },
      },
      contracts: {
        orderBy: {
          generatedAt: "desc",
        },
      },
      submissionLinks: true,
      submissions: true,
      auditLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      },
    },
  });

  if (!caseItem) {
    notFound();
  }

  return (
    <main className="toss-page">
      <div className="toss-container">
        <Link
          href="/cases"
          className="mb-6 inline-block text-sm font-medium text-[#6b7684] hover:text-[#3182f6]"
        >
          {lang === "zh" ? "← 返回案件列表" : "← Back to Cases"}
        </Link>

        {deleteError === "linked_data" && (
          <div className="mb-6 rounded-[24px] border border-[#ffd9de] bg-[#fff2f4] p-4">
            <p className="text-sm font-medium text-[#f04452]">
              {lang === "zh"
                ? "该案件暂时不能删除，因为仍有关联的文件、提交记录、上传链接或合同。"
                : "This case cannot be deleted because linked documents, submissions, upload links, or contracts exist."}
            </p>
          </div>
        )}

        <div className="toss-card mb-8 p-8">
          <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-[40px] font-extrabold tracking-[-0.03em] text-[#191f28]">
                {caseItem.caseCode}
              </h1>
              <p className="mt-3 text-[15px] text-[#6b7684]">
                {lang === "zh" ? "案件详情与状态管理" : "Case details and status management"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/cases/${caseItem.id}/edit`}
                className="toss-secondary-button px-5 py-3 text-sm font-semibold"
              >
                {lang === "zh" ? "编辑案件" : "Edit Case"}
              </Link>

              <Link
  href={`/cases/${caseItem.id}/contracts/new`}
  className="toss-primary-button px-5 py-3 text-sm font-semibold"
>
  {lang === "zh" ? "生成合同" : "Generate Contract"}
</Link>

              <form action={deleteCase}>
                <input type="hidden" name="caseId" value={caseItem.id} />
                <ConfirmSubmitButton
                  label={lang === "zh" ? "删除案件" : "Delete Case"}
                  confirmMessage={
                    lang === "zh"
                      ? "确认要删除这个案件吗？此操作无法撤销。"
                      : "Are you sure you want to delete this case? This action cannot be undone."
                  }
                  className="toss-danger-button px-5 py-3 text-sm font-semibold"
                />
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 text-sm md:grid-cols-2">
            <div>
              <p className="toss-label mb-2">{lang === "zh" ? "客户" : "Client"}</p>
              <Link
                href={`/clients/${caseItem.client.id}`}
                className="text-[15px] font-semibold text-[#191f28] hover:text-[#3182f6]"
              >
                {caseItem.client.chineseName}
              </Link>
            </div>

            <div>
              <p className="toss-label mb-2">{lang === "zh" ? "英文名" : "English Name"}</p>
              <p className="text-[15px] text-[#333d4b]">
                {caseItem.client.englishName ?? "-"}
              </p>
            </div>

            <div>
              <p className="toss-label mb-2">{lang === "zh" ? "业务类型" : "Service Type"}</p>
              <p className="text-[15px] text-[#333d4b]">{caseItem.serviceType}</p>
            </div>

            <div>
              <p className="toss-label mb-2">{lang === "zh" ? "国家" : "Country"}</p>
              <p className="text-[15px] text-[#333d4b]">{caseItem.country}</p>
            </div>

            <div>
              <p className="toss-label mb-2">{lang === "zh" ? "状态" : "Status"}</p>
              <StatusBadge value={caseItem.status} lang={lang} />
            </div>

            <div>
              <p className="toss-label mb-2">{lang === "zh" ? "合同状态" : "Contract Status"}</p>
              <StatusBadge value={caseItem.contractStatus} lang={lang} />
            </div>

            <div>
              <p className="toss-label mb-2">{lang === "zh" ? "信息收集状态" : "Intake Status"}</p>
              <StatusBadge value={caseItem.intakeStatus} lang={lang} />
            </div>

            <div>
              <p className="toss-label mb-2">{lang === "zh" ? "顾问" : "Consultant"}</p>
              <p className="text-[15px] text-[#333d4b]">
                {caseItem.assignedConsultant?.name ?? "-"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="toss-label mb-2">{lang === "zh" ? "备注" : "Notes"}</p>
            <p className="text-[15px] leading-7 text-[#4e5968]">{caseItem.notes ?? "-"}</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <a href="#documents-section" className="toss-card block p-6 hover:-translate-y-[1px]">
            <p className="toss-label mb-3">{lang === "zh" ? "文件" : "Documents"}</p>
            <h2 className="toss-stat-number">{caseItem.documents.length}</h2>
          </a>

          <a href="#contracts-section" className="toss-card block p-6 hover:-translate-y-[1px]">
            <p className="toss-label mb-3">{lang === "zh" ? "合同" : "Contracts"}</p>
            <h2 className="toss-stat-number">{caseItem.contracts.length}</h2>
          </a>

          <a href="#upload-links-section" className="toss-card block p-6 hover:-translate-y-[1px]">
            <p className="toss-label mb-3">{lang === "zh" ? "上传链接" : "Upload Links"}</p>
            <h2 className="toss-stat-number">{caseItem.submissionLinks.length}</h2>
          </a>

          <a href="#submissions-section" className="toss-card block p-6 hover:-translate-y-[1px]">
            <p className="toss-label mb-3">{lang === "zh" ? "提交记录" : "Submissions"}</p>
            <h2 className="toss-stat-number">{caseItem.submissions.length}</h2>
          </a>
        </div>

        <div className="toss-card mb-8 p-8">
          <h2 className="mb-6 text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
            {lang === "zh" ? "更新案件状态" : "Update Case Status"}
          </h2>

          <form action={updateCaseStatus} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <input type="hidden" name="caseId" value={caseItem.id} />

            <div>
              <label className="toss-label mb-3 block">{lang === "zh" ? "状态" : "Status"}</label>
              <select name="status" defaultValue={caseItem.status} className="w-full px-4 py-3">
                {CASE_STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {lang === "zh" ? item.zh : item.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="toss-label mb-3 block">{lang === "zh" ? "合同状态" : "Contract Status"}</label>
              <select
                name="contractStatus"
                defaultValue={caseItem.contractStatus}
                className="w-full px-4 py-3"
              >
                {CONTRACT_STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {lang === "zh" ? item.zh : item.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="toss-label mb-3 block">{lang === "zh" ? "信息收集状态" : "Intake Status"}</label>
              <select
                name="intakeStatus"
                defaultValue={caseItem.intakeStatus}
                className="w-full px-4 py-3"
              >
                {INTAKE_STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {lang === "zh" ? item.zh : item.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-1 md:col-span-3">
              <button
                type="submit"
                className="toss-primary-button px-6 py-3 text-sm font-semibold"
              >
                {lang === "zh" ? "保存状态" : "Save Status"}
              </button>
            </div>
          </form>
        </div>

        <UploadLinksSection
          caseId={caseItem.id}
          links={caseItem.submissionLinks}
          lang={lang}
          onGenerateAction={generateUploadLink}
          onDeactivateAction={deactivateUploadLink}
          onDeleteAction={deleteUploadLink}
        />

        <ContractsSection
          caseId={caseItem.id}
          contracts={caseItem.contracts}
          onDeleteAction={deleteContract}
          lang={lang}
        />

        <SubmissionsSection
          caseId={caseItem.id}
          submissions={caseItem.submissions}
          onDeleteAction={deleteSubmission}
          lang={lang}
        />

        <DocumentsSection
          caseId={caseItem.id}
          documents={caseItem.documents}
          onDeleteAction={deleteDocument}
          onUpdateReviewStatusAction={updateDocumentReviewStatus}
          onUpdateDisplayNameAction={updateDocumentDisplayName}
          lang={lang}
        />

        <AuditLogsSection
          caseId={caseItem.id}
          logs={caseItem.auditLogs}
          lang={lang}
          onDeleteAction={deleteAuditLog}
          onDeleteSelectedAction={deleteSelectedAuditLogs}
        />
      </div>
    </main>
  );
}