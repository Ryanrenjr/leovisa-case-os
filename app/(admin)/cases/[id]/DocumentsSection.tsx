"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";

type DocumentItem = {
  id: string;
  originalFilename: string;
  displayName: string | null;
  normalizedFilename: string | null;
  docType: string;
  mimeType: string | null;
  fileSize: bigint | null;
  reviewStatus: string;
  storageProvider: string;
  storageUrl: string | null;
  storagePath: string | null;
  createdAt: Date;
  submission: {
    submittedByName: string | null;
  } | null;
};

type DocumentsSectionProps = {
  caseId: string;
  documents: DocumentItem[];
  onDeleteAction: (formData: FormData) => void;
  onUpdateReviewStatusAction: (formData: FormData) => void;
  onUpdateDisplayNameAction: (formData: FormData) => void;
  lang: "en" | "zh";
};

export default function DocumentsSection({
  caseId,
  documents,
  onDeleteAction,
  onUpdateReviewStatusAction,
  onUpdateDisplayNameAction,
  lang,
}: DocumentsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleDocuments = expanded ? documents : documents.slice(0, 3);
  const hasMore = documents.length > 3;

  return (
    <div id="documents-section" className="toss-card mb-8 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
          {lang === "zh" ? "文件" : "Documents"}
        </h2>
        <p className="text-sm font-medium text-[#8b95a1]">
          {documents.length} {lang === "zh" ? "个文件" : "file(s)"}
        </p>
      </div>

      {documents.length === 0 ? (
        <p className="text-[15px] text-[#8b95a1]">
          {lang === "zh" ? "暂无文件。" : "No documents yet."}
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
                  </div>

                  <div className="shrink-0 flex gap-2">
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
                  </div>

                  <div>
                    <p className="toss-label mb-2">
                      {lang === "zh" ? "上传时间" : "Uploaded At"}
                    </p>
                    <p className="text-[15px] text-[#4e5968]">
                      {new Date(document.createdAt).toLocaleString()}
                    </p>
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
                    {lang === "zh" ? "审核操作" : "Review Action"}
                  </p>

                  <form
                    action={onUpdateReviewStatusAction}
                    className="space-y-3"
                  >
                    <input type="hidden" name="caseId" value={caseId} />
                    <input
                      type="hidden"
                      name="documentId"
                      value={document.id}
                    />

                    <select
                      name="reviewStatus"
                      defaultValue={document.reviewStatus}
                      className="w-full px-4 py-3"
                    >
                      <option value="uploaded">uploaded</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                      <option value="needs_resubmission">
                        needs_resubmission
                      </option>
                    </select>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="toss-secondary-button px-4 py-3 text-sm font-semibold"
                      >
                        {lang === "zh"
                          ? "更新审核状态"
                          : "Update Review Status"}
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
                  ? `显示更多 (${documents.length - 3})`
                  : `Show More (${documents.length - 3})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}