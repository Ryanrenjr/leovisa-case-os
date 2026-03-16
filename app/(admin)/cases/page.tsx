import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import StatusBadge from "../../../components/StatusBadge";

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

      <form
        method="GET"
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <div className="md:col-span-2">
          <label className="block text-sm text-white/70 mb-2">Search</label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by case code, client name, service type, country"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Status</label>
          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
          >
            <option value="">All statuses</option>
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
          <label className="block text-sm text-white/70 mb-2">Consultant</label>
          <select
            name="consultant"
            defaultValue={consultant}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
          >
            <option value="">All consultants</option>
            {consultants.map((item: { id: string; name: string }) => (
  <option key={item.id} value={item.id}>
    {item.name}
  </option>
))}
          </select>
        </div>

        <div className="md:col-span-4 flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-white text-black px-5 py-2 font-medium"
          >
            Apply Filters
          </button>

          <Link
            href="/cases"
            className="rounded-lg border border-white/10 px-5 py-2 text-white/80"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="mb-4 text-sm text-white/60">
        {totalCases} case(s) found · Page {currentPage} of {totalPages}
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
      <td className="px-6 py-4">
        <StatusBadge value={item.status} />
      </td>
      <td className="px-6 py-4">
        {item.assignedConsultant?.name ?? "-"}
      </td>
    </tr>
  )
)}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-white/50">
          Showing {cases.length} item(s) on this page
        </div>

        <div className="flex gap-3">
          {previousPage ? (
            <Link
              href={buildCasesPageUrl(previousPage)}
              className="rounded-lg border border-white/10 px-4 py-2 text-white/80 hover:bg-white/10"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-lg border border-white/10 px-4 py-2 text-white/30">
              Previous
            </span>
          )}

          {nextPage ? (
            <Link
              href={buildCasesPageUrl(nextPage)}
              className="rounded-lg border border-white/10 px-4 py-2 text-white/80 hover:bg-white/10"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-lg border border-white/10 px-4 py-2 text-white/30">
              Next
            </span>
          )}
        </div>
      </div>
    </main>
  );
}