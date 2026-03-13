import { prisma } from "../lib/prisma";

export default async function Home() {
  const usersCount = await prisma.user.count();
  const clientsCount = await prisma.client.count();
  const casesCount = await prisma.case.count();
  const contractsCount = await prisma.contract.count();

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Case OS Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Users</p>
          <h2 className="text-3xl font-semibold">{usersCount}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Clients</p>
          <h2 className="text-3xl font-semibold">{clientsCount}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Cases</p>
          <h2 className="text-3xl font-semibold">{casesCount}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60 mb-2">Contracts</p>
          <h2 className="text-3xl font-semibold">{contractsCount}</h2>
        </div>
      </div>
    </main>
  );
}