"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthDropdown from "./AuthDropdown";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Sermons & Articles" },
  { href: "/courses", label: "Courses" },
  { href: "/series", label: "Series" },
  { href: "/ethos", label: "Ethos" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 text-cream transition-all duration-500 ${
        scrolled
          ? "bg-[#1a0f05]/92 backdrop-blur-xl border-b border-cream/[0.06] shadow-[0_4px_24px_rgba(26,15,5,0.6)]"
          : "bg-transparent"
      }`}
    >
      <nav
        className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="font-serif text-xl sm:text-2xl font-bold text-cream hover:text-gold transition-colors duration-200 tracking-tight flex items-center gap-3"
          aria-label="Fire Within University — Home"
        >
          Fire Within University
        </Link>

        <ul className="hidden md:flex items-center gap-8 list-none">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-[13px] font-medium transition-all duration-300 relative
                  after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1.5px]
                  after:bg-gold after:transition-transform after:duration-300 after:origin-left
                  hover:text-gold hover:after:scale-x-100
                  ${pathname === href ? "text-gold after:scale-x-100" : "text-cream/80 after:scale-x-0"}`}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/donate"
              className="bg-orange hover:bg-orange-hover text-cream text-[13px] font-semibold px-5 py-2.5 rounded-full transition-all duration-300 shadow-[0_2px_12px_rgba(196,94,26,0.25)] hover:shadow-[0_4px_20px_rgba(196,94,26,0.4)] hover:-translate-y-0.5 min-h-[44px] flex items-center"
            >
              Give
            </Link>
          </li>
          <li>
            <AuthDropdown />
          </li>
        </ul>

        <button
          className="md:hidden p-3 text-cream rounded-lg hover:bg-cream/10 transition-colors min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1.5"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <span className={`block w-6 h-0.5 bg-cream transition-all duration-200 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block w-6 h-0.5 bg-cream transition-all duration-200 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-cream transition-all duration-200 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`md:hidden bg-[#1a0f05]/95 backdrop-blur-md border-t border-cream/20 overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <ul className="flex flex-col px-4 pb-4 gap-1 list-none">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`block py-4 text-base font-medium border-b border-cream/10 transition-all duration-150 hover:text-gold hover:pl-1 ${pathname === href ? "text-gold pl-1" : "text-cream/90"}`}
                onClick={() => setMobileOpen(false)}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link
              href="/donate"
              className="block text-center bg-orange hover:bg-orange-hover text-cream text-sm font-semibold px-5 py-3.5 rounded-full transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Give
            </Link>
          </li>
          <li className="pt-3 flex justify-center">
            <AuthDropdown />
          </li>
        </ul>
      </div>
    </header>
  );
}
