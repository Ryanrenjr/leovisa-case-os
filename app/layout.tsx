import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <div className="min-h-screen flex">
          <aside className="w-64 border-r border-white/10 bg-white/5 p-6">
            <h1 className="text-2xl font-bold mb-8">LeoVisa Case OS</h1>

            <nav className="space-y-3">
              <Link
                href="/"
                className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/clients"
                className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
              >
                Clients
              </Link>

              <Link
                href="/cases"
                className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
              >
                Cases
              </Link>
            </nav>
          </aside>

          <div className="flex-1">
            <header className="border-b border-white/10 bg-white/5 px-8 py-4">
              <p className="text-sm text-white/60">Internal Admin Panel</p>
            </header>

            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
