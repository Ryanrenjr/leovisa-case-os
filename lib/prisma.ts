import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  // only use accelerateUrl if the string begins with prisma:// or prisma+postgres://
  const clientOptions: any = { log: ["query", "error", "warn"] }
  if (url && (url.startsWith("prisma://") || url.startsWith("prisma+postgres://"))) {
    clientOptions.accelerateUrl = url
  } else if (url) {
    // when not using accelerate, provide a Postgres adapter so engine type client is satisfied
    clientOptions.adapter = new PrismaPg({ connectionString: url })
  }

  return new PrismaClient(clientOptions).$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}