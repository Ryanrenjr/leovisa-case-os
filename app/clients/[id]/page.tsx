import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";

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

const auditLogs = await prisma.auditLog.findMany({
  where: {
    relatedEntityType: "client",
    relatedEntityId: id,
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 5,
});


  if (!client) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <Link
        href="/clients"
        className="inline-block mb-6 text-sm text-white/70 underline underline-offset-4"
      >
        ← Back to Clients
      </Link>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8">
        <h1 className="text-4xl font-bold mb-6">{client.chineseName}</h1>

        <div className="mb-6">
  <Link
    href={`/cases/new?clientId=${client.id}`}
    className="inline-block rounded-lg bg-white text-black px-4 py-2 font-medium"
  >
    Create Case for This Client
  </Link>
</div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/50 mb-1">English Name</p>
            <p>{client.englishName}</p>
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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-semibold mb-6">Cases</h2>

        {client.cases.length === 0 ? (
          <p className="text-white/60">No cases yet.</p>
        ) : (
          <div className="space-y-4">
            {client.cases.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <Link
                  href={`/cases/${item.id}`}
                  className="font-semibold underline underline-offset-4"
                >
                  {item.caseCode}
                </Link>
                <p className="text-sm text-white/70 mt-1">
                  {item.serviceType} · {item.country}
                </p>
                <p className="text-sm text-white/50 mt-1">
                  Status: {item.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mt-8">
  <h2 className="text-2xl font-semibold mb-6">Recent Audit Logs</h2>

  {auditLogs.length === 0 ? (
    <p className="text-white/60">No audit logs yet.</p>
  ) : (
    <div className="space-y-4">
      {auditLogs.map((log) => (
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
