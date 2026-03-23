import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "../../../lib/prisma";
import StatusBadge from "../../../components/StatusBadge";
import { getLangFromCookie, messages } from "../../../lib/i18n";

type CasesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    consultant?: string;
    page?: string;
  }>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);
  const t = messages[lang];

  const q = params.q?.trim() || "";
  const status = params.status?.trim() || "";
  const consultant = params.consultant?.trim() || "";

  const currentPage = Math.max(1, Number(params.page || "1"));
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  const consultants = await prisma.user.findMany({
    where: {
      role: "consultant",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  const whereClause = {
    AND: [
      q
        ? {
            OR: [
              {
                caseCode: {
                  contains: q,
                },
              },
              {
                serviceType: {
                  contains: q,
                },
              },
              {
                country: {
                  contains: q,
                },
              },
              {
                client: {
                  chineseName: {
                    contains: q,
                  },
                },
              },
              {
                client: {
                  englishName: {
                    contains: q,
                  },
                },
              },
            ],
          }
        : {},
      status
        ? {
            status,
          }
        : {},
      consultant
        ? {
            assignedConsultantId: consultant,
          }
        : {},
    ],
  };

  const totalCases = await prisma.case.count({
    where: whereClause,
  });

  const cases = await prisma.case.findMany({
    where: whereClause,
    include: {
      client: true,
      assignedConsultant: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: pageSize,
  });

  const totalPages = Math.max(1, Math.ceil(totalCases / pageSize));
  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  function buildCasesPageUrl(page: number) {
    const search = new URLSearchParams();

    if (q) search.set("q", q);
    if (status) search.set("status", status);
    if (consultant) search.set("consultant", consultant);
    search.set("page", String(page));

    return `/cases?${search.toString()}`;
  }

  return (
    <main className="toss-page">
      <div className="toss-container">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="toss-title">{t.cases.title}</h1>
            <p className="toss-subtitle">
              {lang === "zh"
                ? "查看、筛选并管理所有案件。"
                : "View, filter, and manage all cases."}
            </p>
          </div>

          <Link
            href="/cases/new"
            className="toss-primary-button px-5 py-3 text-sm font-semibold"
          >
            {t.cases.newCase}
          </Link>
        </div>

        <form
          method="GET"
          className="toss-card mb-8 grid grid-cols-1 gap-4 p-6 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <label className="toss-label mb-3 block">{t.common.search}</label>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={t.cases.searchPlaceholder}
              className="w-full px-4 py-3"
            />
          </div>

          <div>
            <label className="toss-label mb-3 block">{t.common.status}</label>
            <select
              name="status"
              defaultValue={status}
              className="w-full px-4 py-3"
            >
              <option value="">{t.common.allStatuses}</option>
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
            <label className="toss-label mb-3 block">{t.common.consultant}</label>
            <select
              name="consultant"
              defaultValue={consultant}
              className="w-full px-4 py-3"
            >
              <option value="">{t.common.allConsultants}</option>
              {consultants.map((item: { id: string; name: string }) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-1 md:col-span-4">
            <button
              type="submit"
              className="toss-primary-button px-5 py-3 text-sm font-semibold"
            >
              {t.common.applyFilters}
            </button>

            <Link
              href="/cases"
              className="toss-secondary-button px-5 py-3 text-sm font-semibold"
            >
              {t.common.reset}
            </Link>
          </div>
        </form>

        <div className="mb-4 text-sm font-medium text-[#8b95a1]">
          {totalCases} {t.cases.caseFound} · {t.common.page} {currentPage}{" "}
          {t.common.of} {totalPages}
        </div>

        <div className="toss-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#fafbfc]">
              <tr className="border-b border-[#eef1f4]">
                <th className="px-6 py-4 text-sm font-semibold text-[#8b95a1]">
                  {t.cases.caseCode}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#8b95a1]">
                  {t.cases.client}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#8b95a1]">
                  {t.cases.serviceType}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#8b95a1]">
                  {t.cases.country}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#8b95a1]">
                  {t.common.status}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-[#8b95a1]">
                  {t.common.consultant}
                </th>
              </tr>
            </thead>

            <tbody>
              {cases.map(
                (item: {
                  id: string;
                  caseCode: string;
                  serviceType: string;
                  country: string;
                  status: string;
                  client: { chineseName: string };
                  assignedConsultant: { name: string } | null;
                }) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#f0f2f5] last:border-b-0 hover:bg-[#fafbfc]"
                  >
                    <td className="px-6 py-5 text-[15px] text-[#191f28]">
                      <Link
                        href={`/cases/${item.id}`}
                        className="font-semibold text-[#191f28] hover:text-[#3182f6]"
                      >
                        {item.caseCode}
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-[15px] text-[#4e5968]">
                      {item.client.chineseName}
                    </td>
                    <td className="px-6 py-5 text-[15px] text-[#4e5968]">
                      {item.serviceType}
                    </td>
                    <td className="px-6 py-5 text-[15px] text-[#4e5968]">
                      {item.country}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge value={item.status} lang={lang} />
                    </td>
                    <td className="px-6 py-5 text-[15px] text-[#4e5968]">
                      {item.assignedConsultant?.name ?? t.common.unassigned}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm font-medium text-[#8b95a1]">
            {t.common.showing} {cases.length} {t.common.itemsOnThisPage}
          </div>

          <div className="flex gap-3">
            {previousPage ? (
              <Link
                href={buildCasesPageUrl(previousPage)}
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
                href={buildCasesPageUrl(nextPage)}
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