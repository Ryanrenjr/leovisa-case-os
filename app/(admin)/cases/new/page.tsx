import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { getLangFromCookie } from "../../../../lib/i18n";
import NewCaseForm from "./NewCaseForm";

type NewCasePageProps = {
  searchParams: Promise<{
    clientId?: string;
    error?: string;
  }>;
};

export default async function NewCasePage({
  searchParams,
}: NewCasePageProps) {
  const params = await searchParams;
  const preselectedClientId = params.clientId?.trim() || "";
  const error = params.error || "";

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
    <main>
      {error === "missing_required_fields" && (
        <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">
            {lang === "zh"
              ? "请先填写客户、业务类型和国家。"
              : "Please complete client, service type, and country first."}
          </p>
        </div>
      )}

      <NewCaseForm
        clients={clients}
        consultants={consultants}
        preselectedClientId={preselectedClientId}
        lang={lang}
      />
    </main>
  );
}