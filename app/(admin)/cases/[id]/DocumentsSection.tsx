"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";

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
    <div
      id="documents-section"
      className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          {lang === "zh" ? "文件" : "Documents"}
        </h2>
        <p className="text-sm text-white/50">
          {documents.length} {lang === "zh" ? "个文件" : "file(s)"}
        </p>
      </div>

      {documents.length === 0 ? (
        <p className="text-white/60">
          {lang === "zh" ? "暂无文件。" : "No documents yet."}
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {visibleDocuments.map((document) => (
              <div
                key={document.id}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-white/50 text-sm mb-1">
                      {lang === "zh" ? "显示名称" : "Display Name"}
                    </p>
                    <p className="font-medium break-all">
                      {document.displayName || document.originalFilename}
                    </p>
                  </div>

                  <div className="shrink-0 flex gap-2">
                    {document.storageUrl ? (
                      <a
                        href={document.storageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block rounded-lg bg-white text-black px-4 py-2 font-medium"
                      >
                        {lang === "zh" ? "打开" : "Open"}
                      </a>
                    ) : (
                      <span className="inline-block rounded-lg border border-white/10 px-4 py-2 text-white/40">
                        {lang === "zh" ? "无文件" : "No File"}
                      </span>
                    )}

                    <form action={onDeleteAction}>
                      <input type="hidden" name="caseId" value={caseId} />
                      <input
                        type="hidden"
                        name="documentId"
                        value={document.id}
                      />
                      <button
                        type="submit"
                        className="inline-block rounded-lg border border-red-500/30 px-4 py-2 font-medium text-red-300 hover:bg-red-500/10"
                      >
                        {lang === "zh" ? "删除" : "Delete"}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "原始文件名" : "Original Filename"}
                    </p>
                    <p className="break-all">{document.originalFilename}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "保存文件名" : "Saved Filename"}
                    </p>
                    <p className="break-all">
                      {document.normalizedFilename ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "文件类型" : "Document Type"}
                    </p>
                    <p>{document.docType}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">MIME Type</p>
                    <p>{document.mimeType ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "文件大小" : "File Size"}
                    </p>
                    <p>
                      {document.fileSize
                        ? `${Number(document.fileSize).toLocaleString()} bytes`
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "审核状态" : "Review Status"}
                    </p>
                    <StatusBadge value={document.reviewStatus} lang={lang} />
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "上传时间" : "Uploaded At"}
                    </p>
                    <p>{new Date(document.createdAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "存储提供方" : "Storage Provider"}
                    </p>
                    <p>{document.storageProvider}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">
                      {lang === "zh" ? "提交人" : "Submitted By"}
                    </p>
                    <p>{document.submission?.submittedByName ?? "-"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-white/50 mb-3 text-sm">
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
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="rounded-lg border border-white/10 px-4 py-3 text-white/80 hover:bg-white/10"
                      >
                        {lang === "zh" ? "保存名称" : "Save Name"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-white/50 mb-3 text-sm">
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
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
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
                        className="rounded-lg border border-white/10 px-4 py-3 text-white/80 hover:bg-white/10"
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
                className="rounded-lg border border-white/10 px-4 py-2 text-white/80 hover:bg-white/10"
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