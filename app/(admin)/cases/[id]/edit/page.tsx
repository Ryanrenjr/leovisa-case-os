import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import EditCaseForm from "../EditCaseForm";

type EditCasePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCasePage({
  params,
}: EditCasePageProps) {
  const { id } = await params;

  const caseItem = await prisma.case.findUnique({
    where: { id },
    select: {
      id: true,
      clientId: true,
      serviceType: true,
      country: true,
      assignedConsultantId: true,
      status: true,
      contractStatus: true,
      intakeStatus: true,
      notes: true,
    },
  });

  if (!caseItem) {
    notFound();
  }

  const clients = await prisma.client.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      chineseName: true,
      englishName: true,
    },
  });

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

  return (
    <EditCaseForm
      caseItem={caseItem}
      clients={clients}
      consultants={consultants}
    />
  );
}