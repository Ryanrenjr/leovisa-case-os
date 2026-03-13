import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function CasesPage() {
  const cases = await prisma.case.findMany({
    include: {
      client: true,
      assignedConsultant: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between mb-8">
  <h1 className="text-4xl font-bold">Cases</h1>

  <Link
    href="/cases/new"
    className="rounded-lg bg-white text-black px-4 py-2 font-medium"
  >
    New Case
  </Link>
</div>


      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-6 py-4 text-sm text-white/70">Case Code</th>
              <th className="px-6 py-4 text-sm text-white/70">Client</th>
              <th className="px-6 py-4 text-sm text-white/70">Service Type</th>
              <th className="px-6 py-4 text-sm text-white/70">Country</th>
              <th className="px-6 py-4 text-sm text-white/70">Status</th>
              <th className="px-6 py-4 text-sm text-white/70">Consultant</th>
            </tr>
          </thead>

          <tbody>
            {cases.map((item) => (
              <tr
                key={item.id}
                className="border-b border-white/10 last:border-b-0 hover:bg-white/5"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/cases/${item.id}`}
                    className="font-medium underline underline-offset-4"
                  >
                    {item.caseCode}
                  </Link>
                </td>
                <td className="px-6 py-4">{item.client.chineseName}</td>
                <td className="px-6 py-4">{item.serviceType}</td>
                <td className="px-6 py-4">{item.country}</td>
                <td className="px-6 py-4">{item.status}</td>
                <td className="px-6 py-4">
                  {item.assignedConsultant?.name ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}