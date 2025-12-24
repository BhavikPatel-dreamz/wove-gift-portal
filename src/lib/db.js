import { PrismaClient } from '@prisma/client'

let prisma = null

const getPrisma = () => {
  if (prisma) {
    return prisma
  }

  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({ log: ['warn', 'error'] })
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient({ log: ['warn', 'error'] })
    }
    prisma = global.prisma
  }

  return prisma
}

export default getPrisma()

// For cases where you need lazy initialization at runtime
export const getPrismaInstance = getPrisma
