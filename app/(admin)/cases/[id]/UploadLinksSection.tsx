"use client";

import UploadLinkActions from "./UploadLinkActions";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";

type SubmissionLinkItem = {
  id: string;
  token: string;
  status: string;
  expiresAt: Date | null;
  maxUses: number | null;
  currentUses: number;
};

type UploadLinksSectionProps = {
  caseId: string;
  links: SubmissionLinkItem[];
  lang: "en" | "zh";
  onGenerateAction: (formData: FormData) => void;
  onDeactivateAction: (formData: FormData) => void;
  onDeleteAction: (formData: FormData) => void;
};

export default function UploadLinksSection({
  caseId,
  links,
  lang,
  onGenerateAction,
  onDeactivateAction,
  onDeleteAction,
}: UploadLinksSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const hasMore = links.length > 3;
  const visibleLinks = expanded ? links : links.slice(0, 3);

  return (
    <div
      id="upload-links-section"
      className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          {lang === "zh" ? "上传链接" : "Upload Links"}
        </h2>

        <form action={onGenerateAction}>
          <input type="hidden" name="caseId" value={caseId} />

          <button
            type="submit"
            className="rounded-lg bg-white text-black px-6 py-3 font-medium"
          >
            {lang === "zh" ? "生成上传链接" : "Generate Upload Link"}
          </button>
        </form>
      </div>

      {links.length === 0 ? (
        <p className="text-white/60">
          {lang === "zh" ? "暂无上传链接。" : "No upload links yet."}
        </p>
      ) : (
        <div className="space-y-4">
          {visibleLinks.map((link) => (
            <div
              key={link.id}
              className="rounded-xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="space-y-2">
                  <p className="text-sm text-white/50">
                    {lang === "zh" ? "分享链接" : "Share URL"}
                  </p>
                  <p className="font-medium break-all">
                    {`http://localhost:3000/upload/${link.token}`}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <UploadLinkActions token={link.token} lang={lang} />

                  {link.status === "active" ? (
                    <form action={onDeactivateAction}>
                      <input type="hidden" name="caseId" value={caseId} />
                      <input type="hidden" name="linkId" value={link.id} />

                      <button
                        type="submit"
                        className="inline-block rounded-lg border border-red-500/30 px-4 py-2 font-medium text-red-300 hover:bg-red-500/10"
                      >
                        {lang === "zh" ? "停用" : "Deactivate"}
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-lg border border-white/10 px-4 py-2 text-center text-white/40">
                      {lang === "zh" ? "已停用" : "Inactive"}
                    </div>
                  )}

                  <form action={onDeleteAction}>
                    <input type="hidden" name="caseId" value={caseId} />
                    <input type="hidden" name="linkId" value={link.id} />

                    <button
                      type="submit"
                      className="inline-block rounded-lg border border-white/10 px-4 py-2 font-medium text-white/70 hover:bg-white/10"
                    >
                      {lang === "zh" ? "删除链接" : "Delete Link"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-white/50 mb-1">
                    {lang === "zh" ? "状态" : "Status"}
                  </p>
                  <StatusBadge value={link.status} lang={lang} />
                </div>

                <div>
                  <p className="text-white/50 mb-1">
                    {lang === "zh" ? "过期时间" : "Expires At"}
                  </p>
                  <p>
                    {link.expiresAt
                      ? new Date(link.expiresAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-white/50 mb-1">
                    {lang === "zh" ? "使用次数" : "Usage"}
                  </p>
                  <p>
                    {link.currentUses} / {link.maxUses ?? "∞"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
              ? `显示更多 (${links.length - 3})`
              : `Show More (${links.length - 3})`}
          </button>
        </div>
      )}
    </div>
  );
}