import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/auditLog";

// ── Role constant ────────────────────────────────────────────────────────────
export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ── Admin whitelist (from env) ───────────────────────────────────────────────
export const adminEmails = [
  process.env.ADMIN_EMAIL_1,
  process.env.ADMIN_EMAIL_2,
].filter(Boolean).map((e) => (e as string).toLowerCase());

function isAdminEmail(email: string): boolean {
  return adminEmails.includes(email.toLowerCase());
}

// ── Admin session timeout ────────────────────────────────────────────────────
const ADMIN_SESSION_MAX_SECONDS = 4 * 60 * 60; // 4 hours

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // Single unified credentials provider — handles both regular users and admins
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          if (isAdminEmail(credentials.email)) {
            logAuditEvent({
              event: "ADMIN_LOGIN_FAILURE",
              email: credentials.email,
              metadata: { reason: "user_not_found" },
            });
          }
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.password);

        if (!valid) {
          if (isAdminEmail(credentials.email)) {
            logAuditEvent({
              event: "ADMIN_LOGIN_FAILURE",
              email: credentials.email,
              userId: user.id,
              metadata: { reason: "invalid_password" },
            });
          }
          return null;
        }

        // Auto-promote whitelisted admin emails
        let effectiveRole: UserRole = user.role as UserRole;
        if (isAdminEmail(credentials.email) && user.role !== UserRole.ADMIN) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: UserRole.ADMIN },
          });
          effectiveRole = UserRole.ADMIN;
        }

        if (effectiveRole === UserRole.ADMIN) {
          logAuditEvent({
            event: "ADMIN_LOGIN_SUCCESS",
            email: credentials.email,
            userId: user.id,
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: effectiveRole,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,

  // 7-day sessions for regular users (admin timeout handled in JWT callback)
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign-in: populate token from user object
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role ?? UserRole.USER;
      }

      // Google OAuth: check admin whitelist and sync DB role
      if (account?.provider === "google" && token.email) {
        token.role = isAdminEmail(token.email) ? UserRole.ADMIN : UserRole.USER;

        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          if (isAdminEmail(token.email) && dbUser.role !== UserRole.ADMIN) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { role: UserRole.ADMIN },
            });
          }
        }
      }

      // Admin session timeout: downgrade after 4 hours
      if (token.role === UserRole.ADMIN && typeof token.iat === "number") {
        const elapsed = Math.floor(Date.now() / 1000) - token.iat;
        if (elapsed > ADMIN_SESSION_MAX_SECONDS) {
          token.role = UserRole.USER;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) ?? UserRole.USER;
      }
      return session;
    },
  },
};
