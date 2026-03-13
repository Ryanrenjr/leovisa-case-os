import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Clients</h1>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-6 py-4 text-sm text-white/70">Chinese Name</th>
              <th className="px-6 py-4 text-sm text-white/70">English Name</th>
              <th className="px-6 py-4 text-sm text-white/70">Email</th>
              <th className="px-6 py-4 text-sm text-white/70">Phone</th>
              <th className="px-6 py-4 text-sm text-white/70">Nationality</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-white/10 last:border-b-0 hover:bg-white/5"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium underline underline-offset-4"
                  >
                    {client.chineseName}
                  </Link>
                </td>
                <td className="px-6 py-4">{client.englishName}</td>
                <td className="px-6 py-4">{client.email ?? "-"}</td>
                <td className="px-6 py-4">{client.phone ?? "-"}</td>
                <td className="px-6 py-4">{client.nationality ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}