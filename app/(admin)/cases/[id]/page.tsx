import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { updateCaseStatus, deleteCase } from "./actions";
import { generateUploadLink } from "./upload-actions";
import {
  deactivateUploadLink,
  deleteUploadLink,
} from "./upload-link-actions";
import {
  deleteDocument,
  updateDocumentReviewStatus,
  updateDocumentDisplayName,
} from "./document-actions";
import DocumentsSection from "./DocumentsSection";
import UploadLinksSection from "./UploadLinksSection";
import SubmissionsSection from "./SubmissionsSection";
import ContractsSection from "./ContractsSection";
import AuditLogsSection from "./AuditLogsSection";
import StatusBadge from "../../../../components/StatusBadge";
import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";
import { deleteSubmission } from "./submission-actions";
import { deleteContract } from "./contract-actions";

type CaseDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    deleteError?: string;
  }>;
};

export default async function CaseDetailPage({
  params,
  searchParams,
}: CaseDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const deleteError = query.deleteError || "";

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

      contracts: {
  orderBy: {
    generatedAt: "desc",
  },
},
      submissionLinks: true,
      documentSubmissions: true,
      auditLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
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
        {deleteError === "linked_data" && (
  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 mb-6">
    <p className="text-red-300">
      This case cannot be deleted because linked documents, submissions, upload links, or contracts exist.
    </p>
  </div>
)}
      </Link>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8">
        <div className="flex items-start justify-between gap-6 mb-6">
  <h1 className="text-4xl font-bold">{caseItem.caseCode}</h1>

  <div className="flex gap-3">
    <Link
      href={`/cases/${caseItem.id}/edit`}
      className="rounded-lg border border-white/10 px-5 py-3 text-white/80 hover:bg-white/10"
    >
      Edit Case
    </Link>

    <div className="flex gap-3">
  <Link
    href={`/cases/${caseItem.id}/edit`}
    className="rounded-lg border border-white/10 px-5 py-3 text-white/80 hover:bg-white/10"
  >
    Edit Case
  </Link>

  <form action={deleteCase}>
  <input type="hidden" name="caseId" value={caseItem.id} />
  <ConfirmSubmitButton
    label="Delete Case"
    confirmMessage="Are you sure you want to delete this case? This action cannot be undone."
    className="rounded-lg border border-red-500/30 px-5 py-3 text-red-300 hover:bg-red-500/10"
  />
</form>
</div>
  </div>
</div>

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
            <StatusBadge value={caseItem.status} />
          </div>

          <div>
            <p className="text-white/50 mb-1">Contract Status</p>
            <StatusBadge value={caseItem.contractStatus} />
          </div>

          <div>
            <p className="text-white/50 mb-1">Intake Status</p>
            <StatusBadge value={caseItem.intakeStatus} />
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

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
  <a
    href="#documents-section"
    className="rounded-2xl border border-white/10 bg-white/5 p-6 block hover:bg-white/10"
  >
    <p className="text-sm text-white/60 mb-2">Documents</p>
    <h2 className="text-3xl font-semibold">{caseItem.documents.length}</h2>
  </a>

  <a
  href="#contracts-section"
  className="rounded-2xl border border-white/10 bg-white/5 p-6 block hover:bg-white/10"
>
  <p className="text-sm text-white/60 mb-2">Contracts</p>
  <h2 className="text-3xl font-semibold">{caseItem.contracts.length}</h2>
</a>

  <a
    href="#upload-links-section"
    className="rounded-2xl border border-white/10 bg-white/5 p-6 block hover:bg-white/10"
  >
    <p className="text-sm text-white/60 mb-2">Upload Links</p>
    <h2 className="text-3xl font-semibold">
      {caseItem.submissionLinks.length}
    </h2>
  </a>

  <a
    href="#submissions-section"
    className="rounded-2xl border border-white/10 bg-white/5 p-6 block hover:bg-white/10"
  >
    <p className="text-sm text-white/60 mb-2">Submissions</p>
    <h2 className="text-3xl font-semibold">
      {caseItem.documentSubmissions.length}
    </h2>
  </a>
</div>


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

<ContractsSection
  caseId={caseItem.id}
  contracts={caseItem.contracts}
  onDeleteAction={deleteContract}
/>

<SubmissionsSection
  caseId={caseItem.id}
  submissions={caseItem.documentSubmissions}
  onDeleteAction={deleteSubmission}
/>
<DocumentsSection
  caseId={caseItem.id}
  documents={caseItem.documents}
  onDeleteAction={deleteDocument}
  onUpdateReviewStatusAction={updateDocumentReviewStatus}
  onUpdateDisplayNameAction={updateDocumentDisplayName}
/>


<AuditLogsSection logs={caseItem.auditLogs} />
      
    </main>
  );
}