import { PrismaClient } from '@prisma/client'

let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ log: ['query'] })
} else {
  // Force refresh in development if shopifySession is not available
  if (!global.prisma || !global.prisma.shopifySession) {
    global.prisma = new PrismaClient({ log: ['query'] })
  }
  prisma = global.prisma
}

export default prisma
