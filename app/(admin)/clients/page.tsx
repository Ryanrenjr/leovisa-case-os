import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "../../../lib/prisma";
import { getLangFromCookie, messages } from "../../../lib/i18n";

type ClientsPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export default async function ClientsPage({
  searchParams,
}: ClientsPageProps) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);
  const t = messages[lang];

  const q = params.q?.trim() || "";
  const currentPage = Math.max(1, Number(params.page || "1"));
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  const whereClause = q
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
    : {};

  const totalClients = await prisma.client.count({
    where: whereClause,
  });

  const clients = await prisma.client.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: pageSize,
  });

  const totalPages = Math.max(1, Math.ceil(totalClients / pageSize));
  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  function buildClientsPageUrl(page: number) {
    const search = new URLSearchParams();

    if (q) search.set("q", q);
    search.set("page", String(page));

    return `/clients?${search.toString()}`;
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">{t.clients.title}</h1>

        <Link
          href="/clients/new"
          className="rounded-lg bg-white text-black px-4 py-2 font-medium"
        >
          {t.clients.newClient}
        </Link>
      </div>

      <form
        method="GET"
        className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <label className="block text-sm text-white/70 mb-2">
          {t.common.search}
        </label>

        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={t.clients.searchPlaceholder}
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
          />

          <button
            type="submit"
            className="rounded-lg bg-white text-black px-5 py-3 font-medium"
          >
            {t.common.search}
          </button>

          <Link
            href="/clients"
            className="rounded-lg border border-white/10 px-5 py-3 text-white/80"
          >
            {t.common.reset}
          </Link>
        </div>
      </form>

      <div className="mb-4 text-sm text-white/60">
        {totalClients} {t.common.found} · {t.common.page} {currentPage}{" "}
        {t.common.of} {totalPages}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-6 py-4 text-sm text-white/70">
                {t.clients.chineseName}
              </th>
              <th className="px-6 py-4 text-sm text-white/70">
                {t.clients.englishName}
              </th>
              <th className="px-6 py-4 text-sm text-white/70">
                {t.clients.email}
              </th>
              <th className="px-6 py-4 text-sm text-white/70">
                {t.clients.phone}
              </th>
              <th className="px-6 py-4 text-sm text-white/70">
                {t.clients.nationality}
              </th>
            </tr>
          </thead>

          <tbody>
            {clients.map(
              (client: {
                id: string;
                chineseName: string;
                englishName: string | null;
                email: string | null;
                phone: string | null;
                nationality: string | null;
              }) => (
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
                  <td className="px-6 py-4">{client.englishName ?? "-"}</td>
                  <td className="px-6 py-4">{client.email ?? "-"}</td>
                  <td className="px-6 py-4">{client.phone ?? "-"}</td>
                  <td className="px-6 py-4">{client.nationality ?? "-"}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-white/50">
          {t.common.showing} {clients.length} {t.common.itemsOnThisPage}
        </div>

        <div className="flex gap-3">
          {previousPage ? (
            <Link
              href={buildClientsPageUrl(previousPage)}
              className="rounded-lg border border-white/10 px-4 py-2 text-white/80 hover:bg-white/10"
            >
              {t.common.previous}
            </Link>
          ) : (
            <span className="rounded-lg border border-white/10 px-4 py-2 text-white/30">
              {t.common.previous}
            </span>
          )}

          {nextPage ? (
            <Link
              href={buildClientsPageUrl(nextPage)}
              className="rounded-lg border border-white/10 px-4 py-2 text-white/80 hover:bg-white/10"
            >
              {t.common.next}
            </Link>
          ) : (
            <span className="rounded-lg border border-white/10 px-4 py-2 text-white/30">
              {t.common.next}
            </span>
          )}
        </div>
      </div>
    </main>
  );
}