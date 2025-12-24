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

// Export as getter to lazy initialize
class PrismaProxy {
  constructor() {
    return new Proxy({}, {
      get: (target, prop) => {
        const instance = getPrisma()
        return instance[prop]
      }
    })
  }
}

const prismaProxy = new PrismaProxy()
export default prismaProxy
export const getPrismaInstance = getPrisma
