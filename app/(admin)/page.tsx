export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";
import { getLangFromCookie, messages } from "../../lib/i18n";
import { getServiceTypeLabel } from "../../lib/service-options";

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

const BUSINESS_LINE_GROUPS = {
  global_citizenship: {
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
    matchers: [
      "Skilled Worker",
      "Settlement",
      "Innovator Founder",
      "Global Talent",
      "High Potential Individual (HPI)",
      "Spouse Visa",
      "Student Visa",
      "Graduate Visa (PSW)",
      "Standard Visitor",
      "10 Year Long Residence",
      "Student Visa / Graduate Visa (PSW)",
      "Skilled Worker Route to Settlement",
      "Spouse Route to Settlement",
    ],
  },
  uk_tob: {
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
  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);
  const t = messages[lang];

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
      label: t.pipeline[status],
      count,
    };
  });

  const maxPipelineCount = Math.max(
    ...pipelineData.map((item) => item.count),
    1
  );

  const businessLineData = Object.entries(BUSINESS_LINE_GROUPS).map(
    ([key, group]) => {
      const count = allCases.filter(
        (item: { status: string; serviceType: string }) =>
          group.matchers.some(
            (matcher) => matcher === getServiceTypeLabel(item.serviceType)
          )
      ).length;

      return {
        key,
        label: t.businessLine[key as keyof typeof t.businessLine],
        count,
      };
    }
  );

  const maxBusinessLineCount = Math.max(
    ...businessLineData.map((item) => item.count),
    1
  );

  return (
    <main className="toss-page">
      <div className="toss-container">
        <div className="mb-10">
          <h1 className="toss-title">{t.dashboard.title}</h1>
          <p className="toss-subtitle">{t.dashboard.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <Link
            href="/clients"
            className="toss-card block p-7 hover:-translate-y-[1px]"
          >
            <p className="toss-label mb-3">{t.dashboard.totalClients}</p>
            <h2 className="toss-stat-number">{clientsCount}</h2>
          </Link>

          <Link
            href="/cases"
            className="toss-card block p-7 hover:-translate-y-[1px]"
          >
            <p className="toss-label mb-3">{t.dashboard.totalCases}</p>
            <h2 className="toss-stat-number">{casesCount}</h2>
          </Link>

          <Link
            href="/cases"
            className="toss-card block p-7 hover:-translate-y-[1px]"
          >
            <p className="toss-label mb-3">{t.dashboard.casesInProgress}</p>
            <h2 className="toss-stat-number">{casesInProgressCount}</h2>
          </Link>

          <Link
            href="/cases"
            className="toss-card block p-7 hover:-translate-y-[1px]"
          >
            <p className="toss-label mb-3">{t.dashboard.completedCases}</p>
            <h2 className="toss-stat-number">{completedCasesCount}</h2>
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="toss-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[28px] leading-tight font-bold tracking-[-0.02em] text-[#191f28]">
                {t.dashboard.casePipelineOverview}
              </h2>
              <Link
                href="/cases"
                className="text-sm font-medium text-[#3182f6] hover:opacity-80"
              >
                {t.dashboard.viewCases}
              </Link>
            </div>

            <div className="space-y-6">
              {pipelineData.map((item) => {
                const widthPercent =
                  item.count === 0 ? 0 : (item.count / maxPipelineCount) * 100;

                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[15px] font-semibold text-[#333d4b]">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-[#8b95a1]">
                        {item.count}
                      </p>
                    </div>

                    <div className="toss-progress-track">
                      <div
                        className="toss-progress-fill"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="toss-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[28px] leading-tight font-bold tracking-[-0.02em] text-[#191f28]">
                {t.dashboard.businessLineBreakdown}
              </h2>
              <Link
                href="/cases"
                className="text-sm font-medium text-[#3182f6] hover:opacity-80"
              >
                {t.dashboard.viewCases}
              </Link>
            </div>

            <div className="space-y-7">
              {businessLineData.map((item) => {
                const widthPercent =
                  item.count === 0 ? 0 : (item.count / maxBusinessLineCount) * 100;

                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[15px] font-semibold text-[#333d4b]">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-[#8b95a1]">
                        {item.count}
                      </p>
                    </div>

                    <div className="toss-progress-track">
                      <div
                        className="toss-progress-fill"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
