import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/auditLog";
import { checkRateLimitDb } from "@/lib/rateLimitDb";
import { getNextAuthSecret, getGoogleClientId, getGoogleClientSecret, getAdminEmail1, getAdminEmail2 } from "@/lib/env";

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const adminEmails = [
  getAdminEmail1(),
  getAdminEmail2(),
].filter((e): e is string => Boolean(e)).map((e) => e.toLowerCase());

function isAdminEmail(email: string): boolean {
  return adminEmails.includes(email.toLowerCase());
}

const ADMIN_SESSION_MAX_SECONDS = 4 * 60 * 60; // 4 hours

// Pre-computed bcrypt hash used to keep failed-login timing constant, so an
// attacker cannot distinguish "no such user" (fast) from "wrong password"
// (slow bcrypt). The plaintext is irrelevant — it will never match.
const DUMMY_PASSWORD_HASH =
  "$2b$12$LCKFyiViMNZe6hhXCfiho.QAXT956Ygz1cQhTVe2XAl1NfpI0QOae";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: getGoogleClientId(),
      clientSecret: getGoogleClientSecret(),
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();

        // Per-account brute-force protection that survives IP rotation and
        // serverless cold starts (audit H2): max 10 attempts / 15 min per email.
        const allowed = await checkRateLimitDb(`login:${email}`, {
          maxRequests: 10,
          windowMs: 15 * 60 * 1000,
        });
        if (!allowed) {
          if (isAdminEmail(email)) {
            logAuditEvent({
              event: "LOGIN_RATE_LIMITED",
              email,
              metadata: { reason: "too_many_attempts" },
            });
          }
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Always run a bcrypt comparison (against a dummy hash when the user or
        // password is absent) so login response time is constant and cannot be
        // used to enumerate which emails have accounts.
        const hashToCompare = user?.password ?? DUMMY_PASSWORD_HASH;
        const passwordMatches = await bcrypt.compare(
          credentials.password,
          hashToCompare
        );

        if (!user || !user.password || !passwordMatches) {
          if (isAdminEmail(email)) {
            logAuditEvent({
              event: "ADMIN_LOGIN_FAILURE",
              email,
              userId: user?.id,
              metadata: { reason: !user || !user.password ? "user_not_found" : "invalid_password" },
            });
          }
          return null;
        }

        // Require a verified email for credentials login (admins are exempt —
        // they're provisioned out-of-band and trusted).
        if (!user.emailVerified && !isAdminEmail(email)) {
          return null;
        }

        const effectiveRole: UserRole = isAdminEmail(email)
          ? UserRole.ADMIN
          : (user.role as UserRole);

        if (effectiveRole === UserRole.ADMIN && user.role !== UserRole.ADMIN) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: UserRole.ADMIN },
          });
        }

        if (effectiveRole === UserRole.ADMIN) {
          logAuditEvent({
            event: "ADMIN_LOGIN_SUCCESS",
            email,
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

  secret: getNextAuthSecret(),

  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },

  callbacks: {
    async jwt({ token, user, account }) {
      // `user`/`account` are only present at sign-in. Treat that as the moment
      // of authentication and stamp an immutable admin-login timestamp.
      const isSignIn = Boolean(user || account);

      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role ?? UserRole.USER;
      }

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

      if (isSignIn && token.role === UserRole.ADMIN) {
        token.adminSince = Math.floor(Date.now() / 1000);
      }

      // Downgrade admin privileges after the max admin session age. Uses an
      // immutable login timestamp (NextAuth re-stamps `iat` on every request,
      // so `iat` would never expire — see audit H1).
      if (token.role === UserRole.ADMIN) {
        const adminSince = typeof token.adminSince === "number" ? token.adminSince : 0;
        const elapsed = Math.floor(Date.now() / 1000) - adminSince;
        if (!adminSince || elapsed > ADMIN_SESSION_MAX_SECONDS) {
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
