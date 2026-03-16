"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";

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
  submissions: SubmissionItem[];
};

export default function SubmissionsSection({
  submissions,
}: SubmissionsSectionProps) {
const [expanded, setExpanded] = useState(false);

const hasMore = submissions.length > 3;
const visibleSubmissions = expanded ? submissions : submissions.slice(0, 3);

  return (
    <div
  id="submissions-section"
  className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8"
>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Submissions</h2>
        <p className="text-sm text-white/50">{submissions.length} submission(s)</p>
      </div>

      {submissions.length === 0 ? (
        <p className="text-white/60">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {visibleSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-xl border border-white/10 bg-black/30 p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/50 mb-1">Submitted By</p>
                  <p>{submission.submittedByName ?? "-"}</p>
                </div>

                <div>
                  <p className="text-white/50 mb-1">Email</p>
                  <p>{submission.submittedByEmail ?? "-"}</p>
                </div>

                <div>
                  <p className="text-white/50 mb-1">Source</p>
                  <p>{submission.source}</p>
                </div>

                <div>
                  <p className="text-white/50 mb-1">Status</p>
                  <StatusBadge value={submission.status} />
                </div>

                <div>
                  <p className="text-white/50 mb-1">Submitted At</p>
                  <p>{new Date(submission.submittedAt).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-white/50 mb-1">Submission Link ID</p>
                  <p className="break-all">{submission.submissionLinkId ?? "-"}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-white/50 mb-1 text-sm">Remarks</p>
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
        ? "Show Less"
        : `Show More (${submissions.length - 3})`}
    </button>
  </div>
)}
    </div>
  );
}