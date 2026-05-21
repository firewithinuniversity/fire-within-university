"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-white rounded-2xl shadow-sm border border-brown/[0.06] p-10 max-w-md w-full">
        <div className="text-4xl mb-4">⚠️</div>

        <h1 className="font-serif text-2xl font-bold text-brown mb-2">
          Dashboard Error
        </h1>

        <p className="text-brown/50 text-sm mb-4">
          Something went wrong loading this page. This is likely a temporary issue.
        </p>

        {error.digest && (
          <p className="text-brown/30 text-xs font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-orange hover:bg-orange/90 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Try Again
          </button>
          <Link
            href="/admin"
            className="border border-brown/20 hover:border-brown/40 text-brown font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
