import { prisma } from "../../../lib/prisma";
import NewCaseForm from "./NewCaseForm";

export default async function NewCasePage() {
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

  return <NewCaseForm clients={clients} consultants={consultants} />;
}
