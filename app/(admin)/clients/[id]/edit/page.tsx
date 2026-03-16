import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
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

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
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

  return <EditClientForm client={client} />;
}