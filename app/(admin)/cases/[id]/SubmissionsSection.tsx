"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";

type SubmissionItem = {
  id: string;
  submittedByName: string | null;
  submittedByEmail: string | null;
  source: string;
  status: string;
  submittedAt: Date;
  submissionLinkId: string | null;
  remarks: string | null;
};

type SubmissionsSectionProps = {
  caseId: string;
  submissions: SubmissionItem[];
  onDeleteAction: (formData: FormData) => void;
  lang: "en" | "zh";
};

export default function SubmissionsSection({
  caseId,
  submissions,
  onDeleteAction,
  lang,
}: SubmissionsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const hasMore = submissions.length > 3;
  const visibleSubmissions = expanded
    ? submissions
    : submissions.slice(0, 3);

  return (
    <div
      id="submissions-section"
      className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          {lang === "zh" ? "提交记录" : "Submissions"}
        </h2>
        <p className="text-sm text-white/50">
          {submissions.length} {lang === "zh" ? "条提交" : "submission(s)"}
        </p>
      </div>

      {submissions.length === 0 ? (
        <p className="text-white/60">
          {lang === "zh" ? "暂无提交记录。" : "No submissions yet."}
        </p>
      ) : (
        <div className="space-y-4">
          {visibleSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-white/50 text-sm mb-1">
                    {lang === "zh" ? "提交记录" : "Submission"}
                  </p>
                  <p className="font-medium">
                    {submission.submittedByName ??
                      (lang === "zh"
                        ? "未命名提交记录"
                        : "Unnamed Submission")}
                  </p>
                </div>

                <form action={onDeleteAction}>
                  <input type="hidden" name="caseId" value={caseId} />
                  <input
                    type="hidden"
                    name="submissionId"
                    value={submission.id}
                  />

                  <ConfirmSubmitButton
                    label={
                      lang === "zh" ? "删除提交记录" : "Delete Submission"
                    }
                    confirmMessage={
                      lang === "zh"
                        ? "确认要删除这条提交记录吗？其下关联的文件记录也会一起删除。"
                        : "Are you sure you want to delete this submission? Linked document records under this submission will also be removed."
                    }
                    className="rounded-lg border border-red-500/30 px-4 py-2 text-red-300 hover:bg-red-500/10"
                  />
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/50 mb-1">
                    {lang === "zh" ? "提交人" : "Submitted By"}
                  </p>
                  <p>{submission.submittedByName ?? "-"}</p>
                </div>

                <div>
                  <p className="text-white/50 mb-1">Email</p>
                  <p>{submission.submittedByEmail ?? "-"}</p>
                </div>

                <div>
                  <p className="text-white/50 mb-1">
                    {lang === "zh" ? "来源" : "Source"}
                  </p>
                  <p>{submission.source}</p>
                </div>

                <div>
                  <p className="text-white/50 mb-1">
                    {lang === "zh" ? "状态" : "Status"}
                  </p>
                  <StatusBadge value={submission.status} lang={lang} />
                </div>

                <div>
                  <p className="text-white/50 mb-1">
                    {lang === "zh" ? "提交时间" : "Submitted At"}
                  </p>
                  <p>{new Date(submission.submittedAt).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-white/50 mb-1">
                    {lang === "zh" ? "上传链接 ID" : "Submission Link ID"}
                  </p>
                  <p className="break-all">{submission.submissionLinkId ?? "-"}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-white/50 mb-1 text-sm">
                  {lang === "zh" ? "备注" : "Remarks"}
                </p>
                <p>{submission.remarks ?? "-"}</p>
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
              ? `显示更多 (${submissions.length - 3})`
              : `Show More (${submissions.length - 3})`}
          </button>
        </div>
      )}
    </div>
  );
}