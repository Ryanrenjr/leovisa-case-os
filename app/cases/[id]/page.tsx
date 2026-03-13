import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { updateCaseStatus } from "./actions";

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
      documents: true,
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Documents</p>
          <h2 className="text-3xl font-semibold">{caseItem.documents.length}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Contracts</p>
          <h2 className="text-3xl font-semibold">{caseItem.contracts.length}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Upload Links</p>
          <h2 className="text-3xl font-semibold">
            {caseItem.submissionLinks.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Submissions</p>
          <h2 className="text-3xl font-semibold">
            {caseItem.documentSubmissions.length}
          </h2>
        </div>
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