"use client";

import { SessionProvider } from "next-auth/react";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gradient-to-br from-cream to-[#f3e8d6]">
        <AdminNav />
        <main className="md:ml-56 min-h-screen">{children}</main>
      </div>
    </SessionProvider>
  );
}
