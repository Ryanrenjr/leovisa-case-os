import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "../../../../../lib/prisma";
import { getLangFromCookie } from "../../../../../lib/i18n";
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

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);

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

  const consultants = await prisma.adminUser.findMany({
  where: {
    role: "consultant",
    isActive: true,
  },
  orderBy: {
    name: "asc",
  },
  select: {
    id: true,
    name: true,
    email: true,
  },
});

  return (
    <EditCaseForm
      caseItem={caseItem}
      clients={clients}
      consultants={consultants}
      lang={lang}
    />
  );
}