// Re-export Prisma types so apps can use `import type { Doctor } from '@ayurconnect/db'`
// The runtime PrismaClient is constructed inside each app (e.g. apps/api/src/plugins/db.ts)
// so connection lifecycles are scoped, not global.
export * from '@prisma/client'
