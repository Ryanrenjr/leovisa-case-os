import { prisma } from "../lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Case OS</h1>
      <p className="mb-2">Database connected successfully.</p>
      <p>Users count: {users.length}</p>
    </main>
  );
}