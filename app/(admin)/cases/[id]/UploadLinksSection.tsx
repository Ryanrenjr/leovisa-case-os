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

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const hasMore = links.length > 3;
  const visibleLinks = expanded ? links : links.slice(0, 3);

  return (
    <div
      id="upload-links-section"
      className="toss-card mb-8 p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
          {lang === "zh" ? "上传链接" : "Upload Links"}
        </h2>

        <form action={onGenerateAction}>
          <input type="hidden" name="caseId" value={caseId} />

          <button
            type="submit"
            className="toss-primary-button px-6 py-3 text-sm font-semibold"
          >
            {lang === "zh" ? "生成上传链接" : "Generate Upload Link"}
          </button>
        </form>
      </div>

      {links.length === 0 ? (
        <p className="text-[15px] text-[#8b95a1]">
          {lang === "zh" ? "暂无上传链接。" : "No upload links yet."}
        </p>
      ) : (
        <div className="space-y-4">
          {visibleLinks.map((link) => (
            <div
              key={link.id}
              className="toss-soft-card p-5"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="toss-label">
                    {lang === "zh" ? "分享链接" : "Share URL"}
                  </p>
                  <p className="break-all text-[15px] font-semibold text-[#191f28]">
                    {`${baseUrl}/upload/${link.token}`}
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
                        className="toss-danger-button px-4 py-2 text-sm font-semibold"
                      >
                        {lang === "zh" ? "停用" : "Deactivate"}
                      </button>
                    </form>
                  ) : (
                    <div className="inline-flex items-center justify-center rounded-2xl border border-[#eef1f4] bg-white px-4 py-2 text-sm font-semibold text-[#c2c8cf]">
                      {lang === "zh" ? "已停用" : "Inactive"}
                    </div>
                  )}

                  <form action={onDeleteAction}>
                    <input type="hidden" name="caseId" value={caseId} />
                    <input type="hidden" name="linkId" value={link.id} />

                    <button
                      type="submit"
                      className="toss-secondary-button px-4 py-2 text-sm font-semibold"
                    >
                      {lang === "zh" ? "删除链接" : "Delete Link"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div>
                  <p className="toss-label mb-2">
                    {lang === "zh" ? "状态" : "Status"}
                  </p>
                  <StatusBadge value={link.status} lang={lang} />
                </div>

                <div>
                  <p className="toss-label mb-2">
                    {lang === "zh" ? "过期时间" : "Expires At"}
                  </p>
                  <p className="text-[15px] text-[#4e5968]">
                    {link.expiresAt
                      ? new Date(link.expiresAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="toss-label mb-2">
                    {lang === "zh" ? "使用次数" : "Usage"}
                  </p>
                  <p className="text-[15px] text-[#4e5968]">
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
            className="toss-secondary-button px-4 py-2 text-sm font-semibold"
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