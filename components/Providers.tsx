"use client";

import { SessionProvider } from "next-auth/react";
import AuthModalProvider from "./AuthModalProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // refetchOnWindowFocus disabled: the session doesn't change while the user
    // tabs away, so avoid an extra /api/auth/session round-trip on every focus.
    // We intentionally keep this client-side (no server session prop) so public
    // pages stay statically generated / ISR rather than becoming dynamic SSR.
    <SessionProvider refetchOnWindowFocus={false}>
      <AuthModalProvider>{children}</AuthModalProvider>
    </SessionProvider>
  );
}
