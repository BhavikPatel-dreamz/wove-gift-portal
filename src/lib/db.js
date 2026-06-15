import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;
const connectionString = "postgresql://neondb_owner:npg_gnEjQ6aqoGM2@ep-royal-mouse-ad4cnrnx-pooler.c-2.us-east-1.aws.neon.tech/WOVE-UPDATES?sslmode=require&channel_binding=require";

const isProd = process.env.NODE_ENV === "production";
if (isProd) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
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
