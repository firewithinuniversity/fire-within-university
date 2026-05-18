/**
 * app/(site)/layout.tsx — Public site layout
 *
 * All public pages (homepage, blog, donate, about, etc.) live inside the
 * (site) route group and inherit this layout on top of the root layout.
 *
 * The (site) folder name doesn't affect URLs — it's purely organizational.
 * /about, /blog, /donate all still work as expected.
 *
 * PATTERN — Layout nesting:
 * Root layout (html, body, fonts)
 *   └── (site) layout (Navbar, Footer, main content area)
 *         └── Individual pages (homepage, blog, etc.)
 *         └── /studio (bypasses this layout — has its own page.tsx only)
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip-to-content link — invisible until focused via keyboard.
          WCAG 2.4.1 requires a mechanism to bypass repeated navigation.
          This lets screen reader and keyboard users jump directly to content.
          "Blessed are those who hunger and thirst for righteousness" —
          we hunger and thirst for accessibility. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-orange focus:text-cream focus:font-semibold focus:px-5 focus:py-3 focus:rounded-full focus:shadow-lg focus:text-sm"
      >
        Skip to content
      </a>
      <Navbar />
      {/* flex-grow pushes footer to bottom on short pages */}
      <main id="main-content" className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
