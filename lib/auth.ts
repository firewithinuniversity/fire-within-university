import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/auditLog";
import { checkRateLimitDb } from "@/lib/rateLimitDb";
import { isAdminEmail } from "@/lib/adminEmails";
import { getNextAuthSecret, getGoogleClientId, getGoogleClientSecret } from "@/lib/env";

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Pre-computed bcrypt hash used to keep failed-login timing constant, so an
// attacker cannot distinguish "no such user" (fast) from "wrong password"
// (slow bcrypt). The plaintext is irrelevant — it will never match.
const DUMMY_PASSWORD_HASH =
  "$2b$12$LCKFyiViMNZe6hhXCfiho.QAXT956Ygz1cQhTVe2XAl1NfpI0QOae";

// Admin sessions auto-downgrade to USER after this many seconds. Stolen admin
// cookies are time-boxed; ordinary sessions still last the JWT maxAge (7 days).
const ADMIN_SESSION_MAX_SECONDS = 4 * 60 * 60;

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

        // Role comes strictly from the allowlist — never from the stored role,
        // which could be a stale ADMIN from before an allowlist removal. Sync
        // the DB in BOTH directions so a de-listed admin is also demoted there.
        const effectiveRole: UserRole = isAdminEmail(email)
          ? UserRole.ADMIN
          : UserRole.USER;

        if (user.role !== effectiveRole) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: effectiveRole },
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
      // `user`/`account` are only present at sign-in.
      const isSignIn = Boolean(user || account);

      if (user) {
        token.id = user.id;
      }

      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          // Same bidirectional sync as the credentials provider: the stored
          // role mirrors the allowlist, including demotion after removal.
          const dbRole = isAdminEmail(token.email)
            ? UserRole.ADMIN
            : UserRole.USER;
          if (dbUser.role !== dbRole) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { role: dbRole },
            });
          }
        }
      }

      // Single authoritative role derivation, run on EVERY request:
      // ADMIN requires (a) the email is on the server-side allowlist right now
      // (so removing an email revokes access mid-session), and (b) the admin
      // session is fresh — adminSince is stamped only at sign-in, so admin
      // privilege expires after ADMIN_SESSION_MAX_SECONDS and requires a
      // re-login, restoring the audit-H1 time-box. Everyone else is USER.
      if (token.email) {
        const allowlisted = isAdminEmail(token.email);
        const now = Math.floor(Date.now() / 1000);
        if (allowlisted && isSignIn) {
          token.adminSince = now;
        }
        const adminFresh =
          typeof token.adminSince === "number" &&
          now - token.adminSince <= ADMIN_SESSION_MAX_SECONDS;
        token.role = allowlisted && adminFresh ? UserRole.ADMIN : UserRole.USER;
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
