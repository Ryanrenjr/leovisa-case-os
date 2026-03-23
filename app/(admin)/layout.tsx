import Link from "next/link";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { getLangFromCookie, messages } from "../../lib/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
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
    <div className="min-h-screen flex bg-black text-white">
      <aside className="w-72 border-r border-white/10 bg-black px-8 py-8">
        <div className="mb-10">
          <h1 className="text-2xl font-bold">LeoVisa Case OS</h1>
          <p className="text-sm text-white/50 mt-2">Internal Admin System</p>
        </div>

        <div className="mb-8">
          <LanguageSwitcher
            currentLang={lang}
            action={setLanguage}
            redirectTo="/"
          />
        </div>

        <nav className="space-y-3">
          <Link
            href="/"
            className="block rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5"
          >
            {t.nav.dashboard}
          </Link>

          <Link
            href="/clients"
            className="block rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5"
          >
            {t.nav.clients}
          </Link>

          <Link
            href="/cases"
            className="block rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5"
          >
            {t.nav.cases}
          </Link>
        </nav>
      </aside>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}