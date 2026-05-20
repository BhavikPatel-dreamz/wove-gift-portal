import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;
const connectionString = process.env.DATABASE_URL;

const isProd = process.env.NODE_ENV === "production";
if (isProd) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: !isProd },
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (!isProd) {
  globalForPrisma.prisma = prisma;
}

export { prisma };
