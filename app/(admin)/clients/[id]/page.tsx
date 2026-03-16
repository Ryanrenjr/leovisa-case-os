import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import StatusBadge from "../../../../components/StatusBadge";

type ClientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { id } = await params;

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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-3">{client.chineseName}</h1>
            <p className="text-white/60 text-lg">{client.englishName ?? "-"}</p>
          </div>

          <Link
            href={`/cases/new?clientId=${client.id}`}
            className="rounded-lg bg-white text-black px-5 py-3 font-medium"
          >
            Create Case for This Client
          </Link>
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