"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthDropdown from "./AuthDropdown";
import SearchBar from "./SearchBar";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Sermons" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
];

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number | null>(null);

  // Throttled scroll handler — one RAF at a time
  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      setScrolled(window.scrollY > 20);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    handleScroll(); // initial check
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  // Close mobile search when navigating
  useEffect(() => {
    setMobileSearchOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Focus trap + Escape + return focus on close
  useEffect(() => {
    if (!mobileOpen) return;

    // Move focus to the first focusable element in the menu
    const menu = menuRef.current;
    if (!menu) return;
    const focusable = Array.from(
      menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );
    focusable[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (!menu) return;
      if (e.key === "Escape") {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      const elements = Array.from(
        menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      );
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 text-cream will-change-[background-color,border-color] transition-colors duration-300 ${
        scrolled
          ? "bg-brown-deep/95 border-b border-cream/[0.06] shadow-[0_4px_24px_rgba(26,15,5,0.6)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center"
        aria-label="Main navigation"
      >
        {/* Logo — left */}
        <Link
          href="/"
          className="font-serif text-lg sm:text-xl font-bold text-cream hover:text-gold transition-colors duration-200 tracking-tight shrink-0"
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
                className={`text-[13px] font-medium transition-colors duration-200 relative
                  after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1.5px]
                  after:bg-gold after:transition-transform after:duration-200 after:origin-left
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
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <SearchBar />
          <Link
            href="/donate"
            className="bg-orange hover:bg-orange-hover text-cream text-[13px] font-semibold px-5 py-2 rounded-full transition-colors duration-200 shadow-[0_2px_12px_rgba(196,94,26,0.25)] hover:shadow-[0_4px_20px_rgba(196,94,26,0.4)] hover:-translate-y-0.5"
          >
            Give
          </Link>
          <AuthDropdown />
        </div>

        {/* Search — mobile */}
        <button
          onClick={() => {
            setMobileSearchOpen((prev) => !prev);
            setMobileOpen(false);
          }}
          className="md:hidden ml-auto p-2 text-cream/70 hover:text-cream rounded-lg hover:bg-cream/10 transition-colors"
          aria-label="Search"
          aria-expanded={mobileSearchOpen}
          aria-controls="mobile-search-panel"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>

        {/* Hamburger — mobile */}
        <button
          ref={hamburgerRef}
          className="md:hidden p-3 text-cream rounded-lg hover:bg-cream/10 transition-colors min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1.5"
          onClick={() => {
            setMobileOpen((prev) => !prev);
            setMobileSearchOpen(false);
          }}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <span className={`block w-5 h-0.5 bg-cream transition-transform duration-200 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} aria-hidden="true" />
          <span className={`block w-5 h-0.5 bg-cream transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`} aria-hidden="true" />
          <span className={`block w-5 h-0.5 bg-cream transition-transform duration-200 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} aria-hidden="true" />
        </button>
      </nav>

      {/* Mobile search bar — slides down */}
      <div
        id="mobile-search-panel"
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          mobileSearchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4">
          <SearchBar onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      </div>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen ? true : undefined}
        className={`md:hidden bg-brown-deep/95 border-t border-cream/[0.06] overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${mobileOpen ? "max-h-[24rem] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <ul className="flex flex-col px-6 py-4 gap-1 list-none">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`block py-3.5 text-[15px] font-medium border-b border-cream/[0.06] transition-colors duration-200 hover:text-gold ${pathname === href ? "text-gold" : "text-cream/80"}`}
                onClick={() => { setMobileOpen(false); hamburgerRef.current?.focus(); }}
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
              onClick={() => { setMobileOpen(false); hamburgerRef.current?.focus(); }}
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
