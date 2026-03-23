import Link from "next/link";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { getLangFromCookie, messages } from "../../lib/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import SidebarDateTime from "../../components/SidebarDateTime";
import { setLanguage } from "../actions/set-language";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
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

            <div className="mb-8 rounded-[24px] bg-[#f3f5f7] p-3">
              <LanguageSwitcher
                currentLang={lang}
                action={setLanguage}
                redirectTo="/"
              />
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