import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "@/lib/env";

// Validates DATABASE_URL is set at startup
getDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
