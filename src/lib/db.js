import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

const createPrismaClient = () => {
  if (!process.env.PRISMA_ACCELERATE_URL) {
    throw new Error("PRISMA_ACCELERATE_URL is not set")
  }

  return new PrismaClient().$extends(withAccelerate())
}

/** @type {ReturnType<typeof createPrismaClient>} */
let prismaClient

if (global.prisma) {
  prismaClient = global.prisma
} else {
  prismaClient = createPrismaClient()
}

export const prisma = prismaClient

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}
