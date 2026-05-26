"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthDropdown from "./AuthDropdown";
import SearchModal from "./SearchModal";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Sermons" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cmd+K / Ctrl+K keyboard shortcut
  const handleSearchShortcut = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleSearchShortcut);
    return () => document.removeEventListener("keydown", handleSearchShortcut);
  }, [handleSearchShortcut]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 text-cream transition-all duration-500 ${
        scrolled
          ? "bg-brown-deep/92 backdrop-blur-xl border-b border-cream/[0.06] shadow-[0_4px_24px_rgba(26,15,5,0.6)]"
          : "bg-transparent"
      }`}
    >
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center"
        aria-label="Main navigation"
      >
        {/* Logo — left */}
        <Link
          href="/"
          className="font-serif text-lg sm:text-xl font-bold text-cream hover:text-gold transition-colors duration-300 tracking-tight shrink-0"
          aria-label="Fire Within University — Home"
        >
          Fire Within University
        </Link>

        {/* Center nav links — desktop */}
        <ul className="hidden md:flex items-center justify-center gap-10 list-none flex-1">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-[13px] font-medium transition-all duration-300 relative
                  after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1.5px]
                  after:bg-gold after:transition-transform after:duration-300 after:origin-left
                  hover:text-gold hover:after:scale-x-100
                  ${pathname === href ? "text-gold after:scale-x-100" : "text-cream/70 after:scale-x-0"}`}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions — desktop */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 text-cream/50 hover:text-cream border border-cream/[0.1] hover:border-cream/[0.2] rounded-full px-3 py-1.5 transition-all text-[12px]"
            aria-label="Search (Ctrl+K)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden lg:inline text-[10px] text-cream/25 bg-cream/[0.06] border border-cream/[0.1] rounded px-1 py-0.5 font-mono ml-1" aria-hidden="true">⌘K</kbd>
          </button>
          <Link
            href="/donate"
            className="bg-orange hover:bg-orange-hover text-cream text-[13px] font-semibold px-5 py-2 rounded-full transition-all duration-300 shadow-[0_2px_12px_rgba(196,94,26,0.25)] hover:shadow-[0_4px_20px_rgba(196,94,26,0.4)] hover:-translate-y-0.5"
          >
            Give
          </Link>
          <AuthDropdown />
        </div>

        {/* Search — mobile */}
        <button
          onClick={() => setSearchOpen(true)}
          className="md:hidden ml-auto p-2 text-cream/50 hover:text-cream rounded-lg hover:bg-cream/10 transition-colors"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>

        {/* Hamburger — mobile */}
        <button
          className="md:hidden p-3 text-cream rounded-lg hover:bg-cream/10 transition-colors min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1.5"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <span className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} aria-hidden="true" />
          <span className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} aria-hidden="true" />
          <span className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} aria-hidden="true" />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        aria-hidden={!mobileOpen}
        className={`md:hidden bg-brown-deep/95 backdrop-blur-xl border-t border-cream/[0.06] overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-[24rem] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <ul className="flex flex-col px-6 py-4 gap-1 list-none">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`block py-3.5 text-[15px] font-medium border-b border-cream/[0.06] transition-all duration-200 hover:text-gold ${pathname === href ? "text-gold" : "text-cream/80"}`}
                onClick={() => setMobileOpen(false)}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="pt-3">
            <Link
              href="/donate"
              className="block text-center bg-orange hover:bg-orange-hover text-cream text-sm font-semibold px-5 py-3 rounded-full transition-colors"
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
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
