import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../../lib/prisma";
import { getServiceTypeLabel } from "../../../../../../lib/service-options";
import CreateContractForm from "./CreateContractForm";

type CreateContractPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CreateContractPage({
  params,
}: CreateContractPageProps) {
  const { id } = await params;

  const caseItem = await prisma.case.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });

  if (!caseItem) {
    notFound();
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="toss-page">
      <div className="toss-container max-w-5xl">
        <div className="mb-6">
          <Link
            href={`/cases/${caseItem.id}`}
            className="inline-block text-sm font-medium text-[#6b7684] hover:text-[#3182f6]"
          >
            ← Back to Case
          </Link>
        </div>

        <div className="toss-card p-8">
          <div className="mb-8">
            <h1 className="toss-title">Generate Contract</h1>
            <p className="toss-subtitle">
              Create a client care letter for {caseItem.caseCode}.
            </p>
          </div>

          <CreateContractForm
            caseId={caseItem.id}
            caseCode={caseItem.caseCode}
            clientName={
            caseItem.client.englishName || caseItem.client.chineseName || ""
          }
            visaType={getServiceTypeLabel(caseItem.serviceType)}
            nationality={caseItem.client.nationality || ""}
            applicationLocation="outside UK"
            defaultDate={today}
          />
        </div>
      </div>
    </main>
  );
}
