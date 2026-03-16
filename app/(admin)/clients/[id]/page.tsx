import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import StatusBadge from "../../../../components/StatusBadge";
import { deleteClient } from "./actions";
import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";

type ClientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    deleteError?: string;
  }>;
};

export default async function ClientDetailPage({
  params,
  searchParams,
}: ClientDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const deleteError = query.deleteError || "";

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      cases: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const totalCases = client.cases.length;
  const activeCases = client.cases.filter(
    (item) => item.status !== "completed" && item.status !== "archived"
  ).length;
  const completedCases = client.cases.filter(
    (item) => item.status === "completed"
  ).length;
  const archivedCases = client.cases.filter(
    (item) => item.status === "archived"
  ).length;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <Link
        href="/clients"
        className="inline-block mb-6 text-sm text-white/70 underline underline-offset-4"
      >
        ← Back to Clients
      </Link>

      {deleteError === "linked_cases" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 mb-6">
          <p className="text-red-300">
            This client cannot be deleted because linked cases exist.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-3">{client.chineseName}</h1>
            <p className="text-white/60 text-lg">{client.englishName ?? "-"}</p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/clients/${client.id}/edit`}
              className="rounded-lg border border-white/10 px-5 py-3 text-white/80 hover:bg-white/10"
            >
              Edit Client
            </Link>

            <Link
              href={`/cases/new?clientId=${client.id}`}
              className="rounded-lg bg-white text-black px-5 py-3 font-medium"
            >
              Create Case for This Client
            </Link>

            <form action={deleteClient}>
  <input type="hidden" name="clientId" value={client.id} />
  <ConfirmSubmitButton
    label="Delete Client"
    confirmMessage="Are you sure you want to delete this client? This action cannot be undone."
    className="rounded-lg border border-red-500/30 px-5 py-3 text-red-300 hover:bg-red-500/10"
  />
</form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-white/50 mb-1">English Name</p>
            <p>{client.englishName ?? "-"}</p>
          </div>

          <div>
            <p className="text-white/50 mb-1">Email</p>
            <p>{client.email ?? "-"}</p>
          </div>

          <div>
            <p className="text-white/50 mb-1">Phone</p>
            <p>{client.phone ?? "-"}</p>
          </div>

          <div>
            <p className="text-white/50 mb-1">WeChat</p>
            <p>{client.wechat ?? "-"}</p>
          </div>

          <div>
            <p className="text-white/50 mb-1">Nationality</p>
            <p>{client.nationality ?? "-"}</p>
          </div>

          <div>
            <p className="text-white/50 mb-1">Client Code</p>
            <p>{client.clientCode ?? "-"}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-white/50 mb-1 text-sm">Notes</p>
          <p>{client.notes ?? "-"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Total Cases</p>
          <h2 className="text-3xl font-semibold">{totalCases}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Active Cases</p>
          <h2 className="text-3xl font-semibold">{activeCases}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Completed Cases</p>
          <h2 className="text-3xl font-semibold">{completedCases}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Archived Cases</p>
          <h2 className="text-3xl font-semibold">{archivedCases}</h2>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Cases</h2>
          <p className="text-sm text-white/50">{client.cases.length} case(s)</p>
        </div>

        {client.cases.length === 0 ? (
          <p className="text-white/60">No cases yet.</p>
        ) : (
          <div className="space-y-4">
            {client.cases.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/cases/${item.id}`}
                      className="font-medium underline underline-offset-4 text-lg"
                    >
                      {item.caseCode}
                    </Link>

                    <p className="text-white/60 mt-2">
                      {item.serviceType} · {item.country}
                    </p>
                  </div>

                  <StatusBadge value={item.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}