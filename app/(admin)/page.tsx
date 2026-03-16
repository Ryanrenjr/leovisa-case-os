import Link from "next/link";
import { prisma } from "../../lib/prisma";

const PIPELINE_STATUSES = [
  "new",
  "intake_pending",
  "documents_collecting",
  "documents_received",
  "under_review",
  "contract_pending",
  "contract_sent",
  "signed",
  "completed",
] as const;

const PIPELINE_LABELS: Record<(typeof PIPELINE_STATUSES)[number], string> = {
  new: "New",
  intake_pending: "Intake Pending",
  documents_collecting: "Documents Collecting",
  documents_received: "Documents Received",
  under_review: "Under Review",
  contract_pending: "Contract Pending",
  contract_sent: "Contract Sent",
  signed: "Signed",
  completed: "Completed",
};

const BUSINESS_LINE_GROUPS = {
  global_citizenship: {
    label: "Global Citizenship",
    matchers: [
      "Greece Residency",
      "Portugal Fund",
      "Malta Residency",
      "Hungary Residency",
      "Japan Business Management",
      "Turkey Citizenship",
      "UAE Golden Visa",
      "Cyprus Residency",
      "Small Country Passport",
    ],
  },
  uk_toc: {
    label: "UK To C",
    matchers: [
      "Skilled Worker",
      "Student and PSW",
      "Spouse Visa",
      "Visitor Visa",
      "Innovator Founder",
      "High Potential Individual",
      "Global Talent",
    ],
  },
  uk_tob: {
    label: "UK To B",
    matchers: [
      "Sponsor License (General)",
      "Sponsor License (Global Movement)",
      "CoS Issue",
      "Compliance Audit",
      "Sole Rep Extension and Settlement",
      "T1E Extension and Settlement",
    ],
  },
} as const;

export default async function Home() {
  const clientsCount = await prisma.client.count();
  const casesCount = await prisma.case.count();

  const casesInProgressCount = await prisma.case.count({
    where: {
      status: {
        in: [
          "new",
          "intake_pending",
          "documents_collecting",
          "documents_received",
          "under_review",
          "contract_pending",
          "contract_sent",
          "signed",
        ],
      },
    },
  });

  const completedCasesCount = await prisma.case.count({
    where: {
      status: "completed",
    },
  });

  const allCases = await prisma.case.findMany({
    select: {
      status: true,
      serviceType: true,
    },
  });

  const pipelineData = PIPELINE_STATUSES.map((status) => {
  const count = allCases.filter(
    (item: { status: string; serviceType: string }) => item.status === status
  ).length;

  return {
    status,
    label: PIPELINE_LABELS[status],
    count,
  };
});

  const maxPipelineCount = Math.max(
    ...pipelineData.map((item) => item.count),
    1
  );

  const businessLineData = Object.entries(BUSINESS_LINE_GROUPS).map(
  ([key, group]) => {
    const count = allCases.filter((item: { status: string; serviceType: string }) =>
      group.matchers.some((matcher) => matcher === item.serviceType)
    ).length;

    return {
      key,
      label: group.label,
      count,
    };
  }
);
  const maxBusinessLineCount = Math.max(
    ...businessLineData.map((item) => item.count),
    1
  );

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Dashboard</h1>
        <p className="text-white/60">
          Overview of clients, cases, and business progress.
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
          <p className="text-sm text-white/60 mb-2">Cases In Progress</p>
          <h2 className="text-3xl font-semibold">{casesInProgressCount}</h2>
        </Link>

        <Link
          href="/cases"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 block hover:bg-white/10"
        >
          <p className="text-sm text-white/60 mb-2">Completed Cases</p>
          <h2 className="text-3xl font-semibold">{completedCasesCount}</h2>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Case Pipeline Overview</h2>
            <Link
              href="/cases"
              className="text-sm text-white/70 underline underline-offset-4"
            >
              View cases
            </Link>
          </div>

          <div className="space-y-5">
            {pipelineData.map((item) => {
              const widthPercent =
                item.count === 0 ? 0 : (item.count / maxPipelineCount) * 100;

              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-white/80">{item.label}</p>
                    <p className="text-sm text-white/50">{item.count}</p>
                  </div>

                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/70"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Business Line Breakdown</h2>
            <Link
              href="/cases"
              className="text-sm text-white/70 underline underline-offset-4"
            >
              View cases
            </Link>
          </div>

          <div className="space-y-6">
            {businessLineData.map((item) => {
              const widthPercent =
                item.count === 0 ? 0 : (item.count / maxBusinessLineCount) * 100;

              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-white/80">{item.label}</p>
                    <p className="text-sm text-white/50">{item.count}</p>
                  </div>

                  <div className="h-4 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/70"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}