"use client";

import { useState } from "react";

type DocumentItem = {
  id: string;
  originalFilename: string;
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
};

export default function DocumentsSection({
  caseId,
  documents,
  onDeleteAction,
}: DocumentsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleDocuments = expanded ? documents : documents.slice(0, 3);
  const hasMore = documents.length > 3;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Documents</h2>
        <p className="text-sm text-white/50">{documents.length} file(s)</p>
      </div>

      {documents.length === 0 ? (
        <p className="text-white/60">No documents yet.</p>
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
                      Original Filename
                    </p>
                    <p className="font-medium break-all">
                      {document.originalFilename}
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
                        Open
                      </a>
                    ) : (
                      <span className="inline-block rounded-lg border border-white/10 px-4 py-2 text-white/40">
                        No File
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
                        Delete
                      </button>
                    </form>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/50 mb-1">Saved Filename</p>
                    <p className="break-all">
                      {document.normalizedFilename ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">Document Type</p>
                    <p>{document.docType}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">MIME Type</p>
                    <p>{document.mimeType ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">File Size</p>
                    <p>
                      {document.fileSize
                        ? `${Number(document.fileSize).toLocaleString()} bytes`
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">Review Status</p>
                    <p>{document.reviewStatus}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">Uploaded At</p>
                    <p>{new Date(document.createdAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">Storage Provider</p>
                    <p>{document.storageProvider}</p>
                  </div>

                  <div>
                    <p className="text-white/50 mb-1">Submitted By</p>
                    <p>{document.submission?.submittedByName ?? "-"}</p>
                  </div>
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
                {expanded ? "Show Less" : `Show More (${documents.length - 3})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}