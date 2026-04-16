import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = global;

// Create adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma instance
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
