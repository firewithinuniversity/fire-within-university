"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Sermons & Articles" },
  { href: "/series", label: "Series" },
  { href: "/ethos", label: "Ethos" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-brown/95 backdrop-blur-md text-cream border-b border-cream/10 shadow-[0_2px_16px_rgba(61,31,10,0.3)] sticky top-0 z-50">
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

        {/* Desktop nav links with animated underline */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm font-medium transition-colors duration-150 relative
                  after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5
                  after:bg-gold after:transition-transform after:duration-200 after:origin-left
                  hover:text-gold hover:after:scale-x-100
                  ${pathname === href ? "text-gold after:scale-x-100" : "text-cream/90 after:scale-x-0"}`}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/donate"
              className="bg-orange hover:bg-orange-hover text-cream text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 min-h-[44px] flex items-center"
            >
              Give
            </Link>
          </li>
        </ul>

        {/* Hamburger — 44px touch target */}
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

      {/* Mobile menu — always rendered, animated with max-height */}
      <div
        id="mobile-menu"
        className={`md:hidden bg-brown/95 backdrop-blur-md border-t border-cream/20 overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
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
        </ul>
      </div>
    </header>
  );
}
