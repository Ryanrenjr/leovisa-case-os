import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { updateCaseStatus } from "./actions";
import { generateUploadLink } from "./upload-actions";
import UploadLinkActions from "./UploadLinkActions";
import {
  deactivateUploadLink,
  deleteUploadLink,
} from "./upload-link-actions";
import { deleteDocument } from "./document-actions";
import DocumentsSection from "./DocumentsSection";
import UploadLinksSection from "./UploadLinksSection";
import SubmissionsSection from "./SubmissionsSection";

type CaseDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CaseDetailPage({
  params,
}: CaseDetailPageProps) {
  const { id } = await params;

  const caseItem = await prisma.case.findUnique({
    where: { id },
    include: {
      client: true,
      assignedConsultant: true,
      documents: {
  orderBy: {
    createdAt: "desc",
  },
  include: {
    submission: true,
  },
},

      contracts: true,
      submissionLinks: true,
      documentSubmissions: true,
      auditLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });

  if (!caseItem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <Link
        href="/cases"
        className="inline-block mb-6 text-sm text-white/70 underline underline-offset-4"
      >
        ← Back to Cases
      </Link>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8">
        <h1 className="text-4xl font-bold mb-6">{caseItem.caseCode}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
          <p className="text-white/50 mb-1">Client</p>
         <Link
             href={`/clients/${caseItem.client.id}`}
             className="underline underline-offset-4"
        >
           {caseItem.client.chineseName}
           </Link>
          </div>


          <div>
            <p className="text-white/50 mb-1">English Name</p>
            <p>{caseItem.client.englishName}</p>
          </div>

          <div>
            <p className="text-white/50 mb-1">Service Type</p>
            <p>{caseItem.serviceType}</p>
          </div>

          <div>
            <p className="text-white/50 mb-1">Country</p>
            <p>{caseItem.country}</p>
          </div>

          <div>
            <p className="text-white/50 mb-1">Status</p>
            <p>{caseItem.status}</p>
          </div>

          <div>
            <p className="text-white/50 mb-1">Contract Status</p>
            <p>{caseItem.contractStatus}</p>
          </div>

          <div>
            <p className="text-white/50 mb-1">Intake Status</p>
            <p>{caseItem.intakeStatus}</p>
          </div>

          <div>
            <p className="text-white/50 mb-1">Consultant</p>
            <p>{caseItem.assignedConsultant?.name ?? "-"}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-white/50 mb-1 text-sm">Notes</p>
          <p>{caseItem.notes ?? "-"}</p>
        </div>
      </div>

      <DocumentsSection
        caseId={caseItem.id}
        documents={caseItem.documents}
        onDeleteAction={deleteDocument}
      />


      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8">
  <h2 className="text-2xl font-semibold mb-6">Update Case Status</h2>

  <form action={updateCaseStatus} className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <input type="hidden" name="caseId" value={caseItem.id} />

    <div>
      <label className="block text-sm text-white/70 mb-2">Status</label>
      <select
        name="status"
        defaultValue={caseItem.status}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
      >
        <option value="new">new</option>
        <option value="intake_pending">intake_pending</option>
        <option value="documents_collecting">documents_collecting</option>
        <option value="documents_received">documents_received</option>
        <option value="under_review">under_review</option>
        <option value="contract_pending">contract_pending</option>
        <option value="contract_sent">contract_sent</option>
        <option value="signed">signed</option>
        <option value="completed">completed</option>
        <option value="archived">archived</option>
      </select>
    </div>

    <div>
      <label className="block text-sm text-white/70 mb-2">Contract Status</label>
      <select
        name="contractStatus"
        defaultValue={caseItem.contractStatus}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
      >
        <option value="not_started">not_started</option>
        <option value="generated">generated</option>
        <option value="sent">sent</option>
        <option value="signed">signed</option>
        <option value="superseded">superseded</option>
      </select>
    </div>

    <div>
      <label className="block text-sm text-white/70 mb-2">Intake Status</label>
      <select
        name="intakeStatus"
        defaultValue={caseItem.intakeStatus}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
      >
        <option value="pending">pending</option>
        <option value="received">received</option>
      </select>
    </div>

    <div className="md:col-span-3 pt-2">
      <button
        type="submit"
        className="rounded-lg bg-white text-black px-6 py-3 font-medium"
      >
        Save Status
      </button>
    </div>
  </form>
</div>

<UploadLinksSection
  caseId={caseItem.id}
  links={caseItem.submissionLinks}
  onGenerateAction={generateUploadLink}
  onDeactivateAction={deactivateUploadLink}
  onDeleteAction={deleteUploadLink}
/>

<SubmissionsSection submissions={caseItem.documentSubmissions} />

<div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8">
  <h2 className="text-2xl font-semibold mb-6">Documents</h2>

  {caseItem.documents.length === 0 ? (
    <p className="text-white/60">No documents yet.</p>
  ) : (
    <div className="space-y-4">
      {caseItem.documents.map((document) => (
        <div
          key={document.id}
          className="rounded-xl border border-white/10 bg-black/30 p-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/50 mb-1">Original Filename</p>
              <p className="break-all">{document.originalFilename}</p>
            </div>

            <div>
              <p className="text-white/50 mb-1">Saved Filename</p>
              <p className="break-all">{document.normalizedFilename ?? "-"}</p>
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
              <p className="text-white/50 mb-1">Storage Provider</p>
              <p>{document.storageProvider}</p>
            </div>

            <div>
              <p className="text-white/50 mb-1">Uploaded At</p>
              <p>{new Date(document.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-white/50 mb-1 text-sm">File Link</p>
            {document.storageUrl ? (
              <a
                href={document.storageUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 break-all"
              >
                {document.storageUrl}
              </a>
            ) : (
              <p>-</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>



      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-semibold mb-6">Recent Audit Logs</h2>

        {caseItem.auditLogs.length === 0 ? (
          <p className="text-white/60">No audit logs yet.</p>
        ) : (
          <div className="space-y-4">
            {caseItem.auditLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <p className="font-medium">{log.actionType}</p>
                <p className="text-sm text-white/60 mt-1">
                  Actor: {log.actorType}
                </p>
                <p className="text-sm text-white/60 mt-1">
                  Success: {log.success ? "Yes" : "No"}
                </p>
                <p className="text-sm text-white/40 mt-1">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}