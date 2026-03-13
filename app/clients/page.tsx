import Link from "next/link";
import { prisma } from "../../lib/prisma";

type ClientsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function ClientsPage({
  searchParams,
}: ClientsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            {
              chineseName: {
                contains: q,
              },
            },
            {
              englishName: {
                contains: q,
              },
            },
            {
              email: {
                contains: q,
              },
            },
            {
              phone: {
                contains: q,
              },
            },
            {
              nationality: {
                contains: q,
              },
            },
            {
              clientCode: {
                contains: q,
              },
            },
          ],
        }
      : {},
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Clients</h1>

        <Link
          href="/clients/new"
          className="rounded-lg bg-white text-black px-4 py-2 font-medium"
        >
          New Client
        </Link>
      </div>

      <form
        method="GET"
        className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <label className="block text-sm text-white/70 mb-2">Search</label>

        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by name, email, phone, nationality, client code"
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
          />

          <button
            type="submit"
            className="rounded-lg bg-white text-black px-5 py-3 font-medium"
          >
            Search
          </button>

          <Link
            href="/clients"
            className="rounded-lg border border-white/10 px-5 py-3 text-white/80"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="mb-4 text-sm text-white/60">
        {clients.length} client(s) found
      </div>

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
