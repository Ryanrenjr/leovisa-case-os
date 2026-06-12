"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";
import {
  DOCUMENT_ARCHIVE_FOLDERS,
  getDocumentArchiveLabel,
} from "../../../../lib/document-archive";
import { formatDateTime } from "../../../../lib/format-date";

type DocumentItem = {
  id: string;
  originalFilename: string;
  displayName: string | null;
  normalizedFilename: string | null;
  docType: string;
  mimeType: string | null;
  fileSize: bigint | null;
  reviewStatus: string;
  resubmissionReason: string | null;
  resubmissionRequestedAt: Date | null;
  storageProvider: string;
  storageUrl: string | null;
  storagePath: string | null;
  archiveFolder: string | null;
  archivedAt: Date | null;
  isFinal: boolean;
  finalizedAt: Date | null;
  createdAt: Date;
  casePerson: {
    id: string;
    role: string;
    relationship: string | null;
    fullName: string;
    sortOrder: number;
  } | null;
  submission: {
    submittedByName: string | null;
  } | null;
};

type ChecklistItem = {
  id: string;
  label: string;
  isRequired: boolean;
  documents: {
    id: string;
    reviewStatus: string;
  }[];
};

type DocumentsSectionProps = {
  caseId: string;
  documents: DocumentItem[];
  checklistItems: ChecklistItem[];
  onDeleteAction: (formData: FormData) => void;
  onUpdateReviewStatusAction: (formData: FormData) => void;
  onUpdateDisplayNameAction: (formData: FormData) => void;
  onArchiveAction: (formData: FormData) => void;
  onUpdateFinalStatusAction: (formData: FormData) => void;
  lang: "en" | "zh";
};

export default function DocumentsSection({
  caseId,
  documents,
  checklistItems,
  onDeleteAction,
  onUpdateReviewStatusAction,
  onUpdateDisplayNameAction,
  onArchiveAction,
  onUpdateFinalStatusAction,
  lang,
}: DocumentsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [archiveFilter, setArchiveFilter] = useState("all");
  const [personFilter, setPersonFilter] = useState("all");

  function getPersonLabel(document: DocumentItem) {
    if (!document.casePerson) {
      return lang === "zh" ? "共同/未分配" : "Shared / Unassigned";
    }

    if (document.casePerson.role === "main_applicant") {
      return `${lang === "zh" ? "主申请人" : "Main Applicant"} - ${
        document.casePerson.fullName
      }`;
    }

    return `${document.casePerson.relationship || (lang === "zh" ? "随行申请人" : "Dependant")} - ${
      document.casePerson.fullName
    }`;
  }

  const personFilterItems = [
    {
      key: "all",
      label: lang === "zh" ? "全部申请人" : "All Applicants",
      count: documents.length,
      sortOrder: -1,
    },
    ...Array.from(
      documents.reduce((map, document) => {
        const key = document.casePerson?.id ?? "shared";
        const existing = map.get(key);
        const label = getPersonLabel(document);
        const sortOrder = document.casePerson?.sortOrder ?? 9999;

        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, { key, label, count: 1, sortOrder });
        }

        return map;
      }, new Map<string, { key: string; label: string; count: number; sortOrder: number }>())
    )
      .map(([, value]) => value)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
  ];

  const archiveFilterItems = [
    {
      key: "all",
      label: lang === "zh" ? "全部" : "All",
      count: documents.length,
    },
    {
      key: "unfiled",
      label: lang === "zh" ? "未归档" : "Unfiled",
      count: documents.filter((document) => !document.archiveFolder).length,
    },
    ...DOCUMENT_ARCHIVE_FOLDERS.map((folder) => ({
      key: folder.key,
      label: folder.label,
      count: documents.filter(
        (document) => document.archiveFolder === folder.key
      ).length,
    })),
    {
      key: "final",
      label: "7.Final",
      count: documents.filter(
        (document) => document.isFinal || document.archiveFolder === "final"
      ).length,
    },
  ];
  const filteredDocuments = documents.filter((document) => {
    const isFinal = document.isFinal || document.archiveFolder === "final";
    const matchesPerson =
      personFilter === "all" ||
      (personFilter === "shared"
        ? !document.casePerson
        : document.casePerson?.id === personFilter);

    if (!matchesPerson) {
      return false;
    }

    if (archiveFilter === "all") {
      return true;
    }

    if (archiveFilter === "final") {
      return isFinal;
    }

    if (archiveFilter === "unfiled") {
      return !document.archiveFolder;
    }

    return document.archiveFolder === archiveFilter;
  });
  const visibleDocuments = expanded
    ? filteredDocuments
    : filteredDocuments.slice(0, 3);
  const hasMore = filteredDocuments.length > 3;
  const pendingReviewDocuments = documents.filter(
    (document) => document.reviewStatus === "uploaded"
  );
  const resubmissionDocuments = documents.filter(
    (document) => document.reviewStatus === "needs_resubmission"
  );
  const missingChecklistItems = checklistItems.filter((item) => {
    if (!item.isRequired) {
      return false;
    }

    return !item.documents.some(
      (document) =>
        document.reviewStatus !== "rejected" &&
        document.reviewStatus !== "needs_resubmission"
    );
  });

  return (
    <div id="documents-section" className="toss-card mb-8 p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
          {lang === "zh" ? "文件" : "Documents"}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium text-[#8b95a1]">
            {documents.length} {lang === "zh" ? "个文件" : "file(s)"}
          </p>
          {documents.length > 0 ? (
            <a
              href={`/cases/${caseId}/documents/download`}
              className="toss-primary-button px-4 py-2 text-sm font-semibold"
            >
              {lang === "zh" ? "打包下载" : "Download ZIP"}
            </a>
          ) : (
            <span className="inline-flex items-center justify-center rounded-2xl border border-[#eef1f4] bg-white px-4 py-2 text-sm font-semibold text-[#c2c8cf]">
              {lang === "zh" ? "暂无可下载文件" : "No files to download"}
            </span>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-[24px] border border-[#e8edf3] bg-[#fafbfc] p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="toss-label mb-2">
              {lang === "zh" ? "待处理事项" : "Action Items"}
            </p>
            <h3 className="text-[22px] font-bold tracking-[-0.02em] text-[#191f28]">
              {lang === "zh"
                ? "文件相关事项集中处理"
                : "Document work in one place"}
            </h3>
          </div>
          <p className="text-sm text-[#6b7684]">
            {lang === "zh"
              ? "先处理这些，再看下面的链接、清单、提交记录和归档。"
              : "Handle these first, then review links, checklist, submissions, and archive."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[#eef1f4] bg-white p-4">
            <p className="text-sm font-semibold text-[#6b7684]">
              {lang === "zh" ? "待审核" : "Pending Review"}
            </p>
            <p className="mt-2 text-[28px] font-extrabold text-[#191f28]">
              {pendingReviewDocuments.length}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#8b95a1]">
              {pendingReviewDocuments
                .slice(0, 3)
                .map((document) => document.displayName || document.originalFilename)
                .join(", ") || (lang === "zh" ? "暂无待审核文件" : "No pending files")}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              {lang === "zh" ? "需重传" : "Needs Resubmission"}
            </p>
            <p className="mt-2 text-[28px] font-extrabold text-red-700">
              {resubmissionDocuments.length}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-red-600">
              {resubmissionDocuments
                .slice(0, 3)
                .map((document) => document.displayName || document.originalFilename)
                .join(", ") || (lang === "zh" ? "暂无需重传文件" : "No resubmission requests")}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-700">
              {lang === "zh" ? "缺失材料" : "Missing Required"}
            </p>
            <p className="mt-2 text-[28px] font-extrabold text-amber-700">
              {missingChecklistItems.length}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-amber-700">
              {missingChecklistItems
                .slice(0, 3)
                .map((item) => item.label)
                .join(", ") || (lang === "zh" ? "必传材料已覆盖" : "Required items covered")}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="toss-label mb-3">
          {lang === "zh" ? "按申请人筛选" : "Filter by Applicant"}
        </p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          {personFilterItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setPersonFilter(item.key);
                setExpanded(false);
              }}
              className={`flex min-h-[56px] items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                personFilter === item.key
                  ? "border-[#3182f6] bg-[#eff6ff] text-[#1b64da]"
                  : "border-[#eef1f4] bg-white text-[#4e5968] hover:bg-[#f8fafc]"
              }`}
            >
              <span className="truncate">{item.label}</span>
              <span
                className={`ml-3 rounded-full px-2 py-1 text-xs ${
                  personFilter === item.key
                    ? "bg-[#dbeafe] text-[#1b64da]"
                    : "bg-[#f2f4f6] text-[#8b95a1]"
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
        {archiveFilterItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setArchiveFilter(item.key);
              setExpanded(false);
            }}
            className={`flex min-h-[56px] items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
              archiveFilter === item.key
                ? "border-[#3182f6] bg-[#eff6ff] text-[#1b64da]"
                : "border-[#eef1f4] bg-white text-[#4e5968] hover:bg-[#f8fafc]"
            }`}
          >
            <span className="truncate">{item.label}</span>
            <span
              className={`ml-3 rounded-full px-2 py-1 text-xs ${
                archiveFilter === item.key
                  ? "bg-[#dbeafe] text-[#1b64da]"
                  : "bg-[#f2f4f6] text-[#8b95a1]"
              }`}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {documents.length === 0 ? (
        <p className="text-[15px] text-[#8b95a1]">
          {lang === "zh" ? "暂无文件。" : "No documents yet."}
        </p>
      ) : filteredDocuments.length === 0 ? (
        <p className="rounded-[20px] border border-[#eef1f4] bg-[#fafbfc] p-5 text-[15px] text-[#8b95a1]">
          {lang === "zh"
            ? "这个文件夹里暂无文件。"
            : "No documents in this folder yet."}
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {visibleDocuments.map((document) => (
              <div key={document.id} className="toss-soft-card p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "显示名称" : "Display Name"}
                    </p>
                    <p className="break-all text-[16px] font-semibold text-[#191f28]">
                      {document.displayName || document.originalFilename}
                    </p>
                    <div className="mt-4">
                      {document.isFinal || document.archiveFolder === "final" ? (
                        <form action={onUpdateFinalStatusAction}>
                          <input type="hidden" name="caseId" value={caseId} />
                          <input
                            type="hidden"
                            name="documentId"
                            value={document.id}
                          />
                          <input type="hidden" name="finalStatus" value="0" />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-2xl border border-[#dbe7ff] bg-[#eef4ff] px-5 py-3 text-sm font-bold text-[#1b64da] shadow-[0_8px_20px_rgba(49,130,246,0.12)]"
                          >
                            {lang === "zh" ? "已在 Final · 点击移出" : "In Final · Remove"}
                          </button>
                        </form>
                      ) : document.reviewStatus === "approved" ? (
                        <form action={onUpdateFinalStatusAction}>
                          <input type="hidden" name="caseId" value={caseId} />
                          <input
                            type="hidden"
                            name="documentId"
                            value={document.id}
                          />
                          <input type="hidden" name="finalStatus" value="1" />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-2xl bg-[#16a34a] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(22,163,74,0.24)] hover:bg-[#15803d]"
                          >
                            {lang === "zh" ? "放入 Final" : "Add to Final"}
                          </button>
                        </form>
                      ) : (
                        <span className="inline-flex items-center rounded-2xl border border-[#eef1f4] bg-[#fafbfc] px-4 py-2 text-sm font-semibold text-[#8b95a1]">
                          {lang === "zh"
                            ? "审核通过后可放入 Final"
                            : "Approve before adding to Final"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-wrap justify-end gap-2">
                  {document.storagePath || document.storageUrl ? (
  <a
    href={`/cases/${caseId}/documents/${document.id}/open`}
    target="_blank"
    rel="noreferrer"
    className="toss-primary-button px-4 py-2 text-sm font-semibold"
  >
    {lang === "zh" ? "打开" : "Open"}
  </a>
) : (
  <span className="inline-flex items-center justify-center rounded-2xl border border-[#eef1f4] bg-white px-4 py-2 text-sm font-semibold text-[#c2c8cf]">
    {lang === "zh" ? "无文件" : "No File"}
  </span>
)}

                    {false && (
                      <>
                    {document.isFinal || document.archiveFolder === "final" ? (
                      <form action={onUpdateFinalStatusAction}>
                        <input type="hidden" name="caseId" value={caseId} />
                        <input
                          type="hidden"
                          name="documentId"
                          value={document.id}
                        />
                        <input type="hidden" name="finalStatus" value="0" />
                        <button
                          type="submit"
                          className="toss-secondary-button px-4 py-2 text-sm font-semibold"
                        >
                          {lang === "zh" ? "移出 Final" : "Remove Final"}
                        </button>
                      </form>
                    ) : document.reviewStatus === "approved" ? (
                      <form action={onUpdateFinalStatusAction}>
                        <input type="hidden" name="caseId" value={caseId} />
                        <input
                          type="hidden"
                          name="documentId"
                          value={document.id}
                        />
                        <input type="hidden" name="finalStatus" value="1" />
                        <button
                          type="submit"
                          className="toss-secondary-button px-4 py-2 text-sm font-semibold"
                        >
                          {lang === "zh" ? "放入 Final" : "Add Final"}
                        </button>
                      </form>
                    ) : null}
                      </>
                    )}

                    <form action={onDeleteAction}>
  <input type="hidden" name="caseId" value={caseId} />
  <input type="hidden" name="documentId" value={document.id} />

  <ConfirmSubmitButton
    label={lang === "zh" ? "删除" : "Delete"}
    confirmMessage={
      lang === "zh"
        ? "确认要删除这个文件吗？删除后将同时移除存储中的文件。"
        : "Are you sure you want to delete this document? This will also remove the stored file."
    }
    className="inline-block rounded-lg border border-red-500/30 px-4 py-2 font-medium text-red-300 hover:bg-red-500/10"
  />
</form>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "原始文件名" : "Original Filename"}
                    </p>
                    <p className="break-all text-[15px] text-[#4e5968]">
                      {document.originalFilename}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "保存文件名" : "Saved Filename"}
                    </p>
                    <p className="break-all text-[15px] text-[#4e5968]">
                      {document.normalizedFilename ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "文件类型" : "Document Type"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {document.docType}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">MIME Type</p>
                    <p className="text-[15px] text-[#4e5968]">
                      {document.mimeType ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "归属申请人" : "Belongs To"}
                    </p>
                    <p className="text-[15px] font-semibold text-[#4e5968]">
                      {getPersonLabel(document)}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "文件大小" : "File Size"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {document.fileSize
                        ? `${Number(document.fileSize).toLocaleString()} bytes`
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "审核状态" : "Review Status"}
                    </p>
                    <StatusBadge value={document.reviewStatus} lang={lang} />
                    {document.reviewStatus === "needs_resubmission" && (
                      <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 p-3">
                        <p className="text-sm font-semibold text-red-700">
                          {lang === "zh"
                            ? "需要重新上传"
                            : "Resubmission required"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-red-700">
                          {document.resubmissionReason ||
                            (lang === "zh"
                              ? "未填写具体原因。"
                              : "No specific reason provided.")}
                        </p>
                        {document.resubmissionRequestedAt && (
                          <p className="mt-1 text-xs text-red-500">
                            {formatDateTime(document.resubmissionRequestedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "归档位置" : "Archive Folder"}
                    </p>
                    <p className="text-[15px] font-semibold text-[#4e5968]">
                      {getDocumentArchiveLabel(
                        document.archiveFolder,
                        lang === "zh" ? "未归档" : "Unfiled"
                      )}
                    </p>
                    {document.archivedAt && (
                      <p className="mt-1 text-xs text-[#8b95a1]">
                        {formatDateTime(document.archivedAt)}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "上传时间" : "Uploaded At"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {formatDateTime(document.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">Final</p>
                    <p className="text-[15px] font-semibold text-[#4e5968]">
                      {document.isFinal || document.archiveFolder === "final"
                        ? lang === "zh"
                          ? "已放入 Final"
                          : "In Final"
                        : "-"}
                    </p>
                    {document.finalizedAt && (
                      <p className="mt-1 text-xs text-[#8b95a1]">
                        {formatDateTime(document.finalizedAt)}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "存储提供方" : "Storage Provider"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {document.storageProvider}
                    </p>
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "提交人" : "Submitted By"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {document.submission?.submittedByName ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[20px] border border-[#eef1f4] bg-[#fafbfc] p-4">
                  <p className="toss-label mb-3">
                    {lang === "zh" ? "显示名称" : "Display Name"}
                  </p>

                  <form action={onUpdateDisplayNameAction} className="space-y-3">
                    <input type="hidden" name="caseId" value={caseId} />
                    <input
                      type="hidden"
                      name="documentId"
                      value={document.id}
                    />

                    <input
                      type="text"
                      name="displayName"
                      defaultValue={document.displayName ?? ""}
                      placeholder={
                        lang === "zh"
                          ? "输入一个更清晰的显示名称"
                          : "Enter a clean display name"
                      }
                      className="w-full px-4 py-3"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="toss-secondary-button px-4 py-3 text-sm font-semibold"
                      >
                        {lang === "zh" ? "保存名称" : "Save Name"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-4 rounded-[20px] border border-[#eef1f4] bg-[#fafbfc] p-4">
                  <p className="toss-label mb-3">
                    {lang === "zh" ? "文件归档" : "File Archive"}
                  </p>

                  <form action={onArchiveAction} className="space-y-3">
                    <input type="hidden" name="caseId" value={caseId} />
                    <input
                      type="hidden"
                      name="documentId"
                      value={document.id}
                    />

                    <select
                      name="archiveFolder"
                      defaultValue={document.archiveFolder ?? ""}
                      className="w-full px-4 py-3"
                      required
                    >
                      <option value="" disabled>
                        {lang === "zh" ? "选择目标文件夹" : "Select folder"}
                      </option>
                      {DOCUMENT_ARCHIVE_FOLDERS.map((folder) => (
                        <option key={folder.key} value={folder.key}>
                          {folder.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="toss-secondary-button px-4 py-3 text-sm font-semibold"
                      >
                        {lang === "zh" ? "放入文件夹" : "Move to Folder"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-4 rounded-[20px] border border-[#eef1f4] bg-[#fafbfc] p-4">
                  <p className="toss-label mb-3">
                    {lang === "zh" ? "审核操作" : "Review Action"}
                  </p>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <form action={onUpdateReviewStatusAction}>
                      <input type="hidden" name="caseId" value={caseId} />
                      <input type="hidden" name="documentId" value={document.id} />
                      <input type="hidden" name="reviewStatus" value="approved" />
                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-[#16a34a] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(22,163,74,0.18)] hover:bg-[#15803d]"
                      >
                        {lang === "zh" ? "审核通过" : "Approve"}
                      </button>
                    </form>

                    <form action={onUpdateReviewStatusAction}>
                      <input type="hidden" name="caseId" value={caseId} />
                      <input type="hidden" name="documentId" value={document.id} />
                      <input type="hidden" name="reviewStatus" value="rejected" />
                      <button
                        type="submit"
                        className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        {lang === "zh" ? "拒绝" : "Reject"}
                      </button>
                    </form>

                    <form action={onUpdateReviewStatusAction}>
                      <input type="hidden" name="caseId" value={caseId} />
                      <input type="hidden" name="documentId" value={document.id} />
                      <input type="hidden" name="reviewStatus" value="uploaded" />
                      <button
                        type="submit"
                        className="w-full toss-secondary-button px-4 py-3 text-sm font-semibold"
                      >
                        {lang === "zh" ? "标记为已上传" : "Mark Uploaded"}
                      </button>
                    </form>
                  </div>

                  <form
                    action={onUpdateReviewStatusAction}
                    className="mt-4 rounded-2xl border border-red-100 bg-white p-4"
                  >
                    <input type="hidden" name="caseId" value={caseId} />
                    <input type="hidden" name="documentId" value={document.id} />
                    <input
                      type="hidden"
                      name="reviewStatus"
                      value="needs_resubmission"
                    />
                    <label className="mb-2 block text-sm font-semibold text-[#4e5968]">
                      {lang === "zh" ? "重新上传原因" : "Resubmission reason"}
                    </label>
                    <textarea
                      name="resubmissionReason"
                      defaultValue={document.resubmissionReason ?? ""}
                      rows={3}
                      placeholder={
                        lang === "zh"
                          ? "例如：照片模糊、信息页缺失、文件过期等"
                          : "e.g. image is blurry, missing information page, expired document"
                      }
                      className="w-full px-4 py-3"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="submit"
                        className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
                      >
                        {lang === "zh"
                          ? "要求重新上传"
                          : "Request Resubmission"}
                      </button>
                    </div>
                  </form>


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
                  ? `显示更多 (${filteredDocuments.length - 3})`
                  : `Show More (${filteredDocuments.length - 3})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
