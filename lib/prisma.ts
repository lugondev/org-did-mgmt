import { PrismaClient } from '@prisma/client'

/**
 * Global Prisma client instance
 * This ensures we don't create multiple instances in development
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Create or reuse Prisma client instance
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Disconnect Prisma client on process termination
 */
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})