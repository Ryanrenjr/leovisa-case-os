import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "../../../../../lib/prisma";
import { getLangFromCookie } from "../../../../../lib/i18n";
import EditCaseForm from "../EditCaseForm";

type EditCasePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditCasePage({
  params,
  searchParams,
}: EditCasePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const error = query.error || "";

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);

  const caseItem = await prisma.case.findUnique({
    where: { id },
    select: {
      id: true,
      reference: true,
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
      error={error}
      lang={lang}
    />
  );
}
