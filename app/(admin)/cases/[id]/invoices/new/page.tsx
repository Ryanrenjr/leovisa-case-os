import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../../lib/prisma";
import { getServiceTypeLabel } from "../../../../../../lib/service-options";
import CreateInvoiceForm from "./CreateInvoiceForm";

type CreateInvoicePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CreateInvoicePage({
  params,
}: CreateInvoicePageProps) {
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
  const clientName =
    caseItem.client.englishName?.trim() ||
    caseItem.client.chineseName?.trim() ||
    "";

  return (
    <main className="toss-page">
      <div className="toss-container max-w-5xl">
        <div className="mb-6">
          <Link
            href={`/cases/${caseItem.id}`}
            className="inline-block text-sm font-medium text-[#6b7684] hover:text-[#3182f6]"
          >
            Back to Case
          </Link>
        </div>

        <div className="toss-card p-8">
          <div className="mb-8">
            <h1 className="toss-title">Generate Invoice</h1>
            <p className="toss-subtitle">
              Create an invoice for {caseItem.reference}.
            </p>
          </div>

          <CreateInvoiceForm
            caseId={caseItem.id}
            reference={caseItem.reference}
            clientName={clientName}
            visaType={getServiceTypeLabel(caseItem.serviceType)}
            defaultDate={today}
          />
        </div>
      </div>
    </main>
  );
}
