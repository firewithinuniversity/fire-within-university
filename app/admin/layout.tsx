"use client";

import { SessionProvider } from "next-auth/react";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-cream">
        <AdminNav />
        <main className="md:ml-56 min-h-screen">{children}</main>
      </div>
    </SessionProvider>
  );
}
