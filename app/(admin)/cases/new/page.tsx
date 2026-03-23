import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { getLangFromCookie } from "../../../../lib/i18n";
import NewCaseForm from "./NewCaseForm";

type NewCasePageProps = {
  searchParams: Promise<{
    clientId?: string;
  }>;
};

export default async function NewCasePage({
  searchParams,
}: NewCasePageProps) {
  const params = await searchParams;
  const preselectedClientId = params.clientId?.trim() || "";

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);

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
    <NewCaseForm
      clients={clients}
      consultants={consultants}
      preselectedClientId={preselectedClientId}
      lang={lang}
    />
  );
}