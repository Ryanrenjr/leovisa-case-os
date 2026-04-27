import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "../../../../../lib/prisma";
import { getLangFromCookie } from "../../../../../lib/i18n";
import EditClientForm from "../EditClientForm";

type EditClientPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditClientPage({
  params,
}: EditClientPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      clientCode: true,
      chineseName: true,
      englishName: true,
      email: true,
      phone: true,
      wechat: true,
      nationality: true,
      notes: true,
    },
  });

  if (!client) {
    notFound();
  }

  return <EditClientForm client={client} lang={lang} />;
}
