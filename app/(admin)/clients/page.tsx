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
    <main className="toss-page">
      <div className="toss-container">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="toss-title">{t.clients.title}</h1>
            <p className="toss-subtitle">
              {lang === "zh"
                ? "查看、搜索并管理客户资料。"
                : "View, search, and manage client profiles."}
            </p>
          </div>

          <Link
            href="/clients/new"
            className="toss-primary-button px-5 py-3 text-sm font-semibold"
          >
            {t.clients.newClient}
          </Link>
        </div>

        <form method="GET" className="toss-card mb-8 p-6">
          <label className="toss-label mb-3 block">{t.common.search}</label>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={t.clients.searchPlaceholder}
              className="flex-1 px-4 py-3"
            />

            <button
              type="submit"
              className="toss-primary-button px-5 py-3 text-sm font-semibold"
            >
              {t.common.search}
            </button>

            <Link
              href="/clients"
              className="toss-secondary-button px-5 py-3 text-sm font-semibold"
            >
              {t.common.reset}
            </Link>
          </div>
        </form>

        <div className="mb-4 text-sm font-medium text-[#8b95a1]">
          {totalClients} {t.common.found} · {t.common.page} {currentPage}{" "}
          {t.common.of} {totalPages}
        </div>

        <div className="toss-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#fafbfc]">
              <tr className="border-b border-[#eef1f4]">
                <th className="px-6 py-4 text-sm font-semibold text-[#8b95a1]">
  {t.clients.englishName}
</th>
<th className="px-6 py-4 text-sm font-semibold text-[#8b95a1]">
  {t.clients.chineseName}
</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#8b95a1]">
                  {t.clients.email}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#8b95a1]">
                  {t.clients.phone}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#8b95a1]">
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
                    className="border-b border-[#f0f2f5] last:border-b-0 hover:bg-[#fafbfc]"
                  >
                    <td className="px-6 py-5 text-[15px] text-[#191f28]">
  <Link
    href={`/clients/${client.id}`}
    className="font-semibold text-[#191f28] hover:text-[#3182f6]"
  >
    {client.englishName?.trim() || "-"}
  </Link>
</td>
<td className="px-6 py-5 text-[15px] text-[#4e5968]">
  {client.chineseName?.trim() || "-"}
</td>
                    <td className="px-6 py-5 text-[15px] text-[#4e5968]">
                      {client.email ?? "-"}
                    </td>
                    <td className="px-6 py-5 text-[15px] text-[#4e5968]">
                      {client.phone ?? "-"}
                    </td>
                    <td className="px-6 py-5 text-[15px] text-[#4e5968]">
                      {client.nationality ?? "-"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm font-medium text-[#8b95a1]">
            {t.common.showing} {clients.length} {t.common.itemsOnThisPage}
          </div>

          <div className="flex gap-3">
            {previousPage ? (
              <Link
                href={buildClientsPageUrl(previousPage)}
                className="toss-secondary-button px-4 py-2 text-sm font-semibold"
              >
                {t.common.previous}
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center rounded-2xl border border-[#eef1f4] bg-white px-4 py-2 text-sm font-semibold text-[#c2c8cf]">
                {t.common.previous}
              </span>
            )}

            {nextPage ? (
              <Link
                href={buildClientsPageUrl(nextPage)}
                className="toss-secondary-button px-4 py-2 text-sm font-semibold"
              >
                {t.common.next}
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center rounded-2xl border border-[#eef1f4] bg-white px-4 py-2 text-sm font-semibold text-[#c2c8cf]">
                {t.common.next}
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}