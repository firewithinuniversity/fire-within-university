"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import AuthModal from "./AuthModal";

export default function AuthDropdown() {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-cream/20 animate-pulse" />;
  }

  if (!session) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm font-medium text-cream/90 hover:text-gold transition-colors"
        >
          Sign In
        </button>
        {showModal && <AuthModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  const initials = (session.user.name || session.user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="flex items-center gap-2 group"
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full border-2 border-cream/30 group-hover:border-gold transition-colors"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center text-cream text-xs font-bold border-2 border-cream/30 group-hover:border-gold transition-colors">
            {initials}
          </div>
        )}
        <svg
          className={`w-3.5 h-3.5 text-cream/60 transition-transform ${showDropdown ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-cream rounded-xl shadow-xl border border-brown/10 py-2 z-[100]">
          <div className="px-4 py-2 border-b border-brown/10">
            <p className="text-sm font-semibold text-brown truncate">
              {session.user.name || "User"}
            </p>
            <p className="text-xs text-brown/50 truncate">{session.user.email}</p>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown hover:bg-brown/5 transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <svg className="w-4 h-4 text-orange" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Portal
            </Link>
          )}

          <button
            onClick={() => {
              setShowDropdown(false);
              signOut({ callbackUrl: "/" });
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-brown/70 hover:bg-brown/5 hover:text-brown transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
