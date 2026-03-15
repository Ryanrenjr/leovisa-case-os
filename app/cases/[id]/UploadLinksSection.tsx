"use client";

import UploadLinkActions from "./UploadLinkActions";

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
  onGenerateAction: (formData: FormData) => void;
  onDeactivateAction: (formData: FormData) => void;
  onDeleteAction: (formData: FormData) => void;
};

export default function UploadLinksSection({
  caseId,
  links,
  onGenerateAction,
  onDeactivateAction,
  onDeleteAction,
}: UploadLinksSectionProps) {
  const hasMore = links.length > 3;
  const visibleLinks = hasMore ? links.slice(0, 3) : links;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Upload Links</h2>

        <form action={onGenerateAction}>
          <input type="hidden" name="caseId" value={caseId} />

          <button
            type="submit"
            className="rounded-lg bg-white text-black px-6 py-3 font-medium"
          >
            Generate Upload Link
          </button>
        </form>
      </div>

      {links.length === 0 ? (
        <p className="text-white/60">No upload links yet.</p>
      ) : (
        <div className="space-y-4">
          {visibleLinks.map((link) => (
            <div
              key={link.id}
              className="rounded-xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="space-y-2">
                  <p className="text-sm text-white/50">Share URL</p>
                  <p className="font-medium break-all">
                    {`http://localhost:3000/upload/${link.token}`}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <UploadLinkActions token={link.token} />

                  {link.status === "active" ? (
                    <form action={onDeactivateAction}>
                      <input type="hidden" name="caseId" value={caseId} />
                      <input type="hidden" name="linkId" value={link.id} />

                      <button
                        type="submit"
                        className="inline-block rounded-lg border border-red-500/30 px-4 py-2 font-medium text-red-300 hover:bg-red-500/10"
                      >
                        Deactivate
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-lg border border-white/10 px-4 py-2 text-center text-white/40">
                      Inactive
                    </div>
                  )}

                  <form action={onDeleteAction}>
                    <input type="hidden" name="caseId" value={caseId} />
                    <input type="hidden" name="linkId" value={link.id} />

                    <button
                      type="submit"
                      className="inline-block rounded-lg border border-white/10 px-4 py-2 font-medium text-white/70 hover:bg-white/10"
                    >
                      Delete Link
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-white/50 mb-1">Status</p>
                  <p>{link.status}</p>
                </div>

                <div>
                  <p className="text-white/50 mb-1">Expires At</p>
                  <p>
                    {link.expiresAt
                      ? new Date(link.expiresAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-white/50 mb-1">Usage</p>
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
          <a
            href="#"
            className="rounded-lg border border-white/10 px-4 py-2 text-white/80 hover:bg-white/10"
          >
            Showing first 3 only
          </a>
        </div>
      )}
    </div>
  );
}