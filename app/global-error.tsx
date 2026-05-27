"use client";

/**
 * app/global-error.tsx — Root layout error boundary
 *
 * Catches errors that occur in the root layout itself. Must render its
 * own <html> and <body> tags because the root layout has failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#1a0f05", margin: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
            fontFamily: "Georgia, serif",
          }}
        >
          <p style={{ fontSize: "5rem", marginBottom: "1rem" }}>🔥</p>

          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "#FDF6EC",
              marginBottom: "0.75rem",
            }}
          >
            Something Went Wrong
          </h1>

          <p
            style={{
              color: "rgba(253, 246, 236, 0.55)",
              fontSize: "1.125rem",
              maxWidth: "28rem",
              marginBottom: "0.5rem",
            }}
          >
            A critical error occurred &mdash; but the fire still burns.
          </p>

          <p
            style={{
              color: "rgba(253, 246, 236, 0.45)",
              fontSize: "0.875rem",
              fontStyle: "italic",
              maxWidth: "24rem",
              marginBottom: "2rem",
            }}
          >
            &ldquo;The Lord is my strength and my shield; my heart trusts in
            him.&rdquo; &mdash; Psalm 28:7
          </p>

          {error.digest && (
            <p
              style={{
                color: "rgba(253, 246, 236, 0.4)",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                marginBottom: "1.5rem",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={reset}
              style={{
                backgroundColor: "#A34D14",
                color: "#FDF6EC",
                fontWeight: 600,
                padding: "0.75rem 2rem",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                border: "1px solid rgba(253, 246, 236, 0.3)",
                color: "#FDF6EC",
                fontWeight: 600,
                padding: "0.75rem 2rem",
                borderRadius: "9999px",
                textDecoration: "none",
                fontSize: "1rem",
              }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
