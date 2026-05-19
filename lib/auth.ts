import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const adminEmails = [
  process.env.ADMIN_EMAIL_1,
  process.env.ADMIN_EMAIL_2,
].filter(Boolean);

const adminUsers = [
  {
    email: process.env.ADMIN_EMAIL_1,
    passwordHash: process.env.ADMIN_PASSWORD_1,
    name: "Brett Breunig",
  },
  {
    email: process.env.ADMIN_EMAIL_2,
    passwordHash: process.env.ADMIN_PASSWORD_2,
    name: "Jude Begay",
  },
];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const admin = adminUsers.find((u) => u.email === credentials.email);
        if (!admin || !admin.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, admin.passwordHash);
        if (!valid) return null;
        return { id: admin.email!, email: admin.email!, name: admin.name, role: "ADMIN" };
      },
    }),
    CredentialsProvider({
      id: "user-credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      if (account?.provider === "google" && token.email) {
        token.role = adminEmails.includes(token.email) ? "ADMIN" : "USER";
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id;
          if (adminEmails.includes(token.email) && dbUser.role !== "ADMIN") {
            await prisma.user.update({ where: { id: dbUser.id }, data: { role: "ADMIN" } });
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    },
  },
};
