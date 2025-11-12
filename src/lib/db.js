import { PrismaClient } from '@prisma/client'

let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ log: ['warn', 'error'] })
} else {
  if (!global.prisma || !global.prisma.shopifySession) {
    global.prisma = new PrismaClient({ log: ['warn', 'error'] })
  }
  prisma = global.prisma
}

export default prisma
