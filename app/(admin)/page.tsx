import Link from "next/link";
import { prisma } from "../../lib/prisma";
import StatusBadge from "../../components/StatusBadge";

export default async function Home() {
  const clientsCount = await prisma.client.count();
  const casesCount = await prisma.case.count();
  const activeUploadLinksCount = await prisma.submissionLink.count({
    where: {
      status: "active",
    },
  });
  const pendingSubmissionsCount = await prisma.documentSubmission.count({
    where: {
      status: "submitted",
    },
  });

  const recentCases = await prisma.case.findMany({
    include: {
      client: true,
      assignedConsultant: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const recentAuditLogs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Dashboard</h1>
        <p className="text-white/60">
          Overview of clients, cases, uploads, and recent activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
  <Link
    href="/clients"
    className="rounded-2xl border border-white/10 bg-white/5 p-6 block hover:bg-white/10"
  >
    <p className="text-sm text-white/60 mb-2">Total Clients</p>
    <h2 className="text-3xl font-semibold">{clientsCount}</h2>
  </Link>

  <Link
    href="/cases"
    className="rounded-2xl border border-white/10 bg-white/5 p-6 block hover:bg-white/10"
  >
    <p className="text-sm text-white/60 mb-2">Total Cases</p>
    <h2 className="text-3xl font-semibold">{casesCount}</h2>
  </Link>

  <Link
    href="/cases"
    className="rounded-2xl border border-white/10 bg-white/5 p-6 block hover:bg-white/10"
  >
    <p className="text-sm text-white/60 mb-2">Active Upload Links</p>
    <h2 className="text-3xl font-semibold">{activeUploadLinksCount}</h2>
  </Link>

  <Link
    href="/cases"
    className="rounded-2xl border border-white/10 bg-white/5 p-6 block hover:bg-white/10"
  >
    <p className="text-sm text-white/60 mb-2">Pending Submissions</p>
    <h2 className="text-3xl font-semibold">{pendingSubmissionsCount}</h2>
  </Link>
</div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recent Cases</h2>
            <Link
              href="/cases"
              className="text-sm text-white/70 underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          {recentCases.length === 0 ? (
            <p className="text-white/60">No cases yet.</p>
          ) : (
            <div className="space-y-4">
              {recentCases.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/cases/${item.id}`}
                        className="font-medium underline underline-offset-4"
                      >
                        {item.caseCode}
                      </Link>
                      <p className="text-sm text-white/60 mt-2">
                        {item.client.chineseName} / {item.client.englishName}
                      </p>
                      <p className="text-sm text-white/50 mt-1">
                        {item.serviceType} · {item.country}
                      </p>
                    </div>

                    <div className="text-right text-sm text-white/50">
                      <div>
  <StatusBadge value={item.status} />
</div>
                      <p className="mt-2">
                        {item.assignedConsultant?.name ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recent Audit Logs</h2>
          </div>

          {recentAuditLogs.length === 0 ? (
            <p className="text-white/60">No audit logs yet.</p>
          ) : (
            <div className="space-y-4">
              {recentAuditLogs.map((log) => {
  const content = (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 hover:bg-white/5">
      <p className="font-medium">{log.actionType}</p>
      <p className="text-sm text-white/60 mt-2">
        Actor: {log.actorType}
      </p>
      <p className="text-sm text-white/60 mt-1">
        Success: {log.success ? "Yes" : "No"}
      </p>
      <p className="text-sm text-white/40 mt-1">
        {new Date(log.createdAt).toLocaleString()}
      </p>
    </div>
  );

  return log.caseId ? (
    <Link key={log.id} href={`/cases/${log.caseId}`} className="block">
      {content}
    </Link>
  ) : (
    <div key={log.id}>{content}</div>
  );
})}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}