/**
 * scripts/seed-admin-users.ts
 *
 * Seeds admin users into the database for the unified credentials provider.
 *
 * Production: reads ADMIN_EMAIL_* and ADMIN_PASSWORD_* from env vars.
 * Dev/test:   creates a test admin account if no env vars are set.
 *
 * Usage: npx tsx scripts/seed-admin-users.ts
 */
import "dotenv/config";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local", override: true });

const prisma = new PrismaClient();

async function main() {
  const admins = [
    { email: process.env.ADMIN_EMAIL_1, passwordHash: process.env.ADMIN_PASSWORD_1, name: "Admin 1" },
    { email: process.env.ADMIN_EMAIL_2, passwordHash: process.env.ADMIN_PASSWORD_2, name: "Admin 2" },
  ].filter((a) => a.email && a.passwordHash);

  if (admins.length === 0) {
    console.log("No ADMIN_EMAIL_* env vars found — skipping seed.");
    return;
  }

  for (const admin of admins) {
    const existing = await prisma.user.findUnique({ where: { email: admin.email! } });

    if (existing) {
      await prisma.user.update({
        where: { email: admin.email! },
        data: { password: admin.passwordHash!, role: "ADMIN", name: admin.name },
      });
      console.log(`Updated existing user to ADMIN: ${admin.email}`);
    } else {
      await prisma.user.create({
        data: {
          email: admin.email!,
          password: admin.passwordHash!,
          role: "ADMIN",
          name: admin.name,
        },
      });
      console.log(`Created ADMIN user: ${admin.email}`);
    }
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
