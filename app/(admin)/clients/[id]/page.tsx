import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { getLangFromCookie } from "../../../../lib/i18n";
import StatusBadge from "../../../../components/StatusBadge";
import { deleteClient } from "./actions";
import ConfirmSubmitButton from "../../../../components/ConfirmSubmitButton";

type ClientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    deleteError?: string;
  }>;
};

export default async function ClientDetailPage({
  params,
  searchParams,
}: ClientDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const deleteError = query.deleteError || "";

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      cases: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const totalCases = client.cases.length;

  const activeCases = client.cases.filter(
    (item: { status: string }) =>
      item.status !== "completed" && item.status !== "archived"
  ).length;

  const completedCases = client.cases.filter(
    (item: { status: string }) => item.status === "completed"
  ).length;

  const archivedCases = client.cases.filter(
    (item: { status: string }) => item.status === "archived"
  ).length;

  return (
    <main className="toss-page">
      <div className="toss-container">
        <Link
          href="/clients"
          className="mb-6 inline-block text-sm font-medium text-[#6b7684] hover:text-[#3182f6]"
        >
          {lang === "zh" ? "← 返回客户列表" : "← Back to Clients"}
        </Link>

        {deleteError === "linked_cases" && (
          <div className="mb-6 rounded-[24px] border border-[#ffd9de] bg-[#fff2f4] p-4">
            <p className="text-sm font-medium text-[#f04452]">
              {lang === "zh"
                ? "该客户暂时不能删除，因为仍有关联案件。"
                : "This client cannot be deleted because linked cases exist."}
            </p>
          </div>
        )}

        <div className="toss-card mb-8 p-8">
          <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-[40px] font-extrabold tracking-[-0.03em] text-[#191f28]">
                {client.chineseName}
              </h1>
              <p className="mt-3 text-lg text-[#6b7684]">
                {client.englishName ?? "-"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/clients/${client.id}/edit`}
                className="toss-secondary-button px-5 py-3 text-sm font-semibold"
              >
                {lang === "zh" ? "编辑客户" : "Edit Client"}
              </Link>

              <Link
                href={`/cases/new?clientId=${client.id}`}
                className="toss-primary-button px-5 py-3 text-sm font-semibold"
              >
                {lang === "zh"
                  ? "为该客户创建案件"
                  : "Create Case for This Client"}
              </Link>

              <form action={deleteClient}>
                <input type="hidden" name="clientId" value={client.id} />
                <ConfirmSubmitButton
                  label={lang === "zh" ? "删除客户" : "Delete Client"}
                  confirmMessage={
                    lang === "zh"
                      ? "确认要删除这个客户吗？此操作无法撤销。"
                      : "Are you sure you want to delete this client? This action cannot be undone."
                  }
                  className="toss-danger-button px-5 py-3 text-sm font-semibold"
                />
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
            <div>
              <p className="toss-label mb-2">
                {lang === "zh" ? "英文名" : "English Name"}
              </p>
              <p className="text-[15px] text-[#333d4b]">
                {client.englishName ?? "-"}
              </p>
            </div>

            <div>
              <p className="toss-label mb-2">
                {lang === "zh" ? "邮箱" : "Email"}
              </p>
              <p className="text-[15px] text-[#333d4b]">{client.email ?? "-"}</p>
            </div>

            <div>
              <p className="toss-label mb-2">
                {lang === "zh" ? "电话" : "Phone"}
              </p>
              <p className="text-[15px] text-[#333d4b]">{client.phone ?? "-"}</p>
            </div>

            <div>
              <p className="toss-label mb-2">WeChat</p>
              <p className="text-[15px] text-[#333d4b]">{client.wechat ?? "-"}</p>
            </div>

            <div>
              <p className="toss-label mb-2">
                {lang === "zh" ? "国籍" : "Nationality"}
              </p>
              <p className="text-[15px] text-[#333d4b]">
                {client.nationality ?? "-"}
              </p>
            </div>

            <div>
              <p className="toss-label mb-2">
                {lang === "zh" ? "客户编号" : "Client Code"}
              </p>
              <p className="text-[15px] text-[#333d4b]">
                {client.clientCode ?? "-"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="toss-label mb-2">
              {lang === "zh" ? "备注" : "Notes"}
            </p>
            <p className="text-[15px] leading-7 text-[#4e5968]">
              {client.notes ?? "-"}
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="toss-card p-6">
            <p className="toss-label mb-3">
              {lang === "zh" ? "案件总数" : "Total Cases"}
            </p>
            <h2 className="toss-stat-number">{totalCases}</h2>
          </div>

          <div className="toss-card p-6">
            <p className="toss-label mb-3">
              {lang === "zh" ? "进行中案件" : "Active Cases"}
            </p>
            <h2 className="toss-stat-number">{activeCases}</h2>
          </div>

          <div className="toss-card p-6">
            <p className="toss-label mb-3">
              {lang === "zh" ? "已完成案件" : "Completed Cases"}
            </p>
            <h2 className="toss-stat-number">{completedCases}</h2>
          </div>

          <div className="toss-card p-6">
            <p className="toss-label mb-3">
              {lang === "zh" ? "已归档案件" : "Archived Cases"}
            </p>
            <h2 className="toss-stat-number">{archivedCases}</h2>
          </div>
        </div>

        <div className="toss-card p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#191f28]">
              {lang === "zh" ? "案件" : "Cases"}
            </h2>
            <p className="text-sm font-medium text-[#8b95a1]">
              {client.cases.length} {lang === "zh" ? "个案件" : "case(s)"}
            </p>
          </div>

          {client.cases.length === 0 ? (
            <p className="text-[15px] text-[#8b95a1]">
              {lang === "zh" ? "暂无案件。" : "No cases yet."}
            </p>
          ) : (
            <div className="space-y-4">
              {client.cases.map(
                (item: {
                  id: string;
                  caseCode: string;
                  serviceType: string;
                  country: string;
                  status: string;
                }) => (
                  <div key={item.id} className="toss-soft-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/cases/${item.id}`}
                          className="text-lg font-semibold text-[#191f28] hover:text-[#3182f6]"
                        >
                          {item.caseCode}
                        </Link>

                        <p className="mt-2 text-[15px] text-[#6b7684]">
                          {item.serviceType} · {item.country}
                        </p>
                      </div>

                      <StatusBadge value={item.status} lang={lang} />
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}