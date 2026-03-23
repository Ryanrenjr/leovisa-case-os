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
    <div id="submissions-section" className="toss-card mb-8 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
          {lang === "zh" ? "提交记录" : "Submissions"}
        </h2>
        <p className="text-sm font-medium text-[#8b95a1]">
          {submissions.length} {lang === "zh" ? "条提交" : "submission(s)"}
        </p>
      </div>

      {submissions.length === 0 ? (
        <p className="text-[15px] text-[#8b95a1]">
          {lang === "zh" ? "暂无提交记录。" : "No submissions yet."}
        </p>
      ) : (
        <div className="space-y-4">
          {visibleSubmissions.map((submission) => (
            <div key={submission.id} className="toss-soft-card p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="toss-label mb-2">
                    {lang === "zh" ? "提交记录" : "Submission"}
                  </p>
                  <p className="text-[16px] font-semibold text-[#191f28]">
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
                    label={lang === "zh" ? "删除提交记录" : "Delete Submission"}
                    confirmMessage={
                      lang === "zh"
                        ? "确认要删除这条提交记录吗？其下关联的文件记录也会一起删除。"
                        : "Are you sure you want to delete this submission? Linked document records under this submission will also be removed."
                    }
                    className="toss-danger-button px-4 py-2 text-sm font-semibold"
                  />
                </form>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <p className="toss-label mb-2">
                    {lang === "zh" ? "提交人" : "Submitted By"}
                  </p>
                  <p className="text-[15px] text-[#4e5968]">
                    {submission.submittedByName ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="toss-label mb-2">Email</p>
                  <p className="text-[15px] text-[#4e5968]">
                    {submission.submittedByEmail ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="toss-label mb-2">
                    {lang === "zh" ? "来源" : "Source"}
                  </p>
                  <p className="text-[15px] text-[#4e5968]">{submission.source}</p>
                </div>

                <div>
                  <p className="toss-label mb-2">
                    {lang === "zh" ? "状态" : "Status"}
                  </p>
                  <StatusBadge value={submission.status} lang={lang} />
                </div>

                <div>
                  <p className="toss-label mb-2">
                    {lang === "zh" ? "提交时间" : "Submitted At"}
                  </p>
                  <p className="text-[15px] text-[#4e5968]">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="toss-label mb-2">
                    {lang === "zh" ? "上传链接 ID" : "Submission Link ID"}
                  </p>
                  <p className="break-all text-[15px] text-[#4e5968]">
                    {submission.submissionLinkId ?? "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="toss-label mb-2 text-sm">
                  {lang === "zh" ? "备注" : "Remarks"}
                </p>
                <p className="text-[15px] text-[#4e5968]">
                  {submission.remarks ?? "-"}
                </p>
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
              ? `显示更多 (${submissions.length - 3})`
              : `Show More (${submissions.length - 3})`}
          </button>
        </div>
      )}
    </div>
  );
}