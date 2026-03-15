import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-4 py-3 text-[15px] font-medium text-white/75 transition-all duration-200 hover:bg-white/10 hover:text-white"
    >
      {label}
    </Link>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <div className="min-h-screen flex">
          <aside className="w-72 border-r border-white/10 bg-black px-8 py-8">
            <div className="mb-12">
              <h1 className="text-[21px] font-semibold tracking-tight text-white">
                LeoVisa Case OS
              </h1>
              <p className="mt-2 text-sm text-white/45">
                Internal Admin System
              </p>
            </div>

            <nav className="space-y-2">
              <Link
                href="/"
                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(255,255,255,0.03)]"
              >
                Dashboard
              </Link>

              <NavItem href="/clients" label="Clients" />
              <NavItem href="/cases" label="Cases" />
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            <header className="h-16 border-b border-white/10 bg-black px-10 flex items-center">
              <p className="text-sm text-white/45">
                李尔王国际移民咨询 · Internal Admin Panel
              </p>
            </header>

            <div>{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
