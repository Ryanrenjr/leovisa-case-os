import Link from "next/link";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLangFromCookie, messages } from "../../lib/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import SidebarDateTime from "../../components/SidebarDateTime";
import { setLanguage } from "../actions/set-language";
import { prisma } from "../../lib/prisma";
import { getAdminSessionUserId } from "../../lib/auth";
import { logoutAction } from "../login/actions";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const adminUserId = await getAdminSessionUserId();

  if (!adminUserId) {
    redirect("/login");
  }

  const adminUser = await prisma.adminUser.findUnique({
  where: { id: adminUserId },
  select: {
    id: true,
    name: true,
    email: true,
    isActive: true,
    role: true,
  },
});

  if (!adminUser || !adminUser.isActive) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);
  const t = messages[lang];

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#111827]">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="w-[340px] shrink-0 border-r border-[#e9edf3] bg-[#f7f8fa] px-6 py-8">
          <div className="rounded-[32px] border border-[#e8edf3] bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center rounded-full bg-[#eef4ff] px-4 py-1.5 text-sm font-semibold text-[#3563e9]">
                LeoVisa
              </div>

              <h1 className="text-[44px] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#111827]">
                Case OS
              </h1>

              <p className="mt-4 text-[17px] leading-7 text-[#6b7280]">
                Internal Admin System
              </p>
            </div>

            <SidebarDateTime lang={lang} />

            <div className="mb-6 rounded-[24px] bg-[#f3f5f7] p-3">
              <LanguageSwitcher
                currentLang={lang}
                action={setLanguage}
                redirectTo="/"
              />
            </div>

            <div className="mb-8 rounded-[28px] border border-[#eef1f4] bg-[linear-gradient(180deg,#ffffff_0%,#fafbfc_100%)] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
  <div className="mb-4 flex items-start justify-between gap-3">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
        Admin
      </p>
      <p className="mt-3 text-[18px] font-bold leading-8 tracking-[-0.02em] text-[#191f28] break-words">
  {adminUser.name}
</p>
      <p className="mt-1 overflow-hidden text-[14px] text-[#6b7280] whitespace-nowrap text-ellipsis">
  {adminUser.email}
</p>
    </div>

    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[15px] font-bold text-[#3563e9]">
      {adminUser.name?.slice(0, 1).toUpperCase()}
    </div>
  </div>

  <div className="mt-5 flex flex-col gap-3">
  <Link
    href="/account/password"
    className="inline-flex w-full items-center justify-center rounded-2xl border border-[#e5e8eb] bg-white px-4 py-3 text-sm font-semibold text-[#4e5968] transition hover:bg-[#f8fafc] hover:text-[#191f28]"
  >
    {lang === "zh" ? "修改密码" : "Change Password"}
  </Link>

  <form action={logoutAction}>
    <button
      type="submit"
      className="inline-flex w-full items-center justify-center rounded-2xl border border-[#ffe0e0] bg-[#fff8f8] px-4 py-3 text-sm font-semibold text-[#e85d5d] transition hover:bg-[#fff1f1]"
    >
      {lang === "zh" ? "退出登录" : "Log Out"}
    </button>
  </form>
</div>
</div>

            <nav className="space-y-3">
              <Link
                href="/"
                className="block rounded-[20px] px-5 py-4 text-[20px] font-semibold text-[#374151] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
              >
                {t.nav.dashboard}
              </Link>

              <Link
                href="/clients"
                className="block rounded-[20px] px-5 py-4 text-[20px] font-semibold text-[#374151] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
              >
                {t.nav.clients}
              </Link>

              <Link
                href="/cases"
                className="block rounded-[20px] px-5 py-4 text-[20px] font-semibold text-[#374151] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
              >
                {t.nav.cases}
              </Link>

              {adminUser.role === "admin" && (
  <Link
    href="/account/admins"
    className="block rounded-[20px] px-5 py-4 text-[20px] font-semibold text-[#374151] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
  >
    {lang === "zh" ? "管理员" : "Admins"}
  </Link>
)}
            </nav>

            <div className="mt-8 rounded-[24px] bg-[#f6f7f9] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9ca3af]">
                Workspace
              </p>
              <p className="mt-3 text-[16px] leading-7 text-[#6b7280]">
                {lang === "zh"
                  ? "用于客户、案件、文件与进度管理。"
                  : "For clients, cases, documents, and progress tracking."}
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}