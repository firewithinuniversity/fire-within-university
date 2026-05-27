"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { validatePassword, isPasswordValid } from "@/lib/passwordValidation";
import { toast } from "sonner";
import { trackSignIn, trackSignUp } from "@/lib/analytics";

type Tab = "signin" | "register" | "forgot";

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl border border-cream/[0.1] bg-brown-deep text-cream focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-0 focus:border-gold placeholder:text-cream/35";

function ModalContent({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Escape key + body scroll lock (existing behaviour preserved)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    // Store the element that had focus before the modal opened
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Move focus to the first focusable element inside the dialog
    const dialog = dialogRef.current;
    if (dialog) {
      const firstFocusable = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
      firstFocusable?.focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((el) => !el.closest("[aria-hidden='true']"));

      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if focus is on the first element, wrap to the last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if focus is on the last element, wrap to the first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);

    return () => {
      document.removeEventListener("keydown", handleTab);
      // Restore focus to the element that was focused before the modal opened
      previousFocusRef.current?.focus();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAgeConfirmed(false);
    setError("");
    setForgotSuccess("");
  }

  function switchTab(t: Tab) {
    resetForm();
    setTab(t);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      toast.error("Invalid email or password.");
    } else {
      toast.success("Welcome back!");
      trackSignIn("credentials");
      onClose();
      router.refresh();
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!ageConfirmed) {
      setError("You must confirm you are at least 13 years old.");
      return;
    }
    if (!isPasswordValid(password)) {
      setError("Please meet all password requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      const msg = data.message || "Registration failed.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);
    if (signInRes?.error) {
      setError("Account created but sign-in failed. Please sign in manually.");
    } else {
      setRegisterSuccess(true);
      trackSignUp("credentials");
      router.refresh();
    }
  }

  async function handleGoogle() {
    trackSignIn("google");
    signIn("google", { callbackUrl: window.location.href });
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setForgotSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
      } else {
        setForgotSuccess(data.message);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const headingId = "auth-modal-heading";

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      className="flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="bg-[#2a1a0e] rounded-2xl shadow-2xl w-full max-w-md relative border border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-cream/50 hover:text-cream hover:bg-cream/10 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tab header */}
        {tab === "forgot" ? (
          <div className="flex border-b border-cream/[0.06]">
            <button
              id={headingId}
              className="flex-1 py-3.5 text-sm font-semibold text-cream border-b-2 border-gold"
            >
              Reset Password
            </button>
          </div>
        ) : (
          <div className="flex border-b border-cream/[0.06]" role="tablist">
            <button
              id={tab === "signin" ? headingId : undefined}
              role="tab"
              aria-selected={tab === "signin"}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${tab === "signin" ? "text-cream border-b-2 border-gold" : "text-cream/60 hover:text-cream/80"}`}
              onClick={() => switchTab("signin")}
            >
              Sign In
            </button>
            <button
              id={tab === "register" ? headingId : undefined}
              role="tab"
              aria-selected={tab === "register"}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${tab === "register" ? "text-cream border-b-2 border-gold" : "text-cream/60 hover:text-cream/80"}`}
              onClick={() => switchTab("register")}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Google sign-in — hidden on forgot password view */}
          {tab !== "forgot" && (
            <>
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 bg-cream/[0.05] border border-cream/[0.1] text-cream font-medium py-3 rounded-xl hover:bg-cream/[0.1] transition-colors mb-5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-cream/[0.08]" />
                <span className="text-xs text-cream/50 uppercase tracking-wide">or</span>
                <div className="flex-1 h-px bg-cream/[0.08]" />
              </div>
            </>
          )}

          {error && (
            <div role="alert" className="bg-red-900/30 text-red-300 text-sm px-4 py-2.5 rounded-lg mb-4 border border-red-700/20">
              {error}
            </div>
          )}

          {tab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-cream/60 mb-1">
                  Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="signin-password" className="block text-sm font-medium text-cream/60 mb-1">
                  Password
                </label>
                <input
                  id="signin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange hover:bg-orange-hover text-cream font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchTab("forgot")}
                  className="text-xs text-cream/50 hover:text-gold transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          ) : tab === "forgot" ? (
            forgotSuccess ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-900/30 border border-green-700/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <p className="text-cream/70 text-sm leading-relaxed" role="status">{forgotSuccess}</p>
                <button
                  type="button"
                  onClick={() => switchTab("signin")}
                  className="text-sm text-gold hover:text-gold/80 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-cream/50 text-sm">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-cream/60 mb-1">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange hover:bg-orange-hover text-cream font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => switchTab("signin")}
                    className="text-xs text-cream/50 hover:text-gold transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )
          ) : registerSuccess ? (
            <div className="text-center space-y-4" role="status">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-900/30 border border-green-700/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-cream font-semibold">Account Created!</h3>
              <p className="text-cream/60 text-sm leading-relaxed">
                We&apos;ve sent a verification link to your email. Please check your inbox to verify your address.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-orange hover:bg-orange-hover text-cream font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Continue
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-cream/60 mb-1">
                  Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-cream/60 mb-1">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-cream/60 mb-1">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT_CLASS}
                />
                {password.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {validatePassword(password).map((c) => (
                      <li key={c.key} className={`flex items-center gap-1.5 text-xs ${c.met ? "text-green-400" : "text-cream/50"}`}>
                        {c.met ? (
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {c.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label htmlFor="register-confirm" className="block text-sm font-medium text-cream/60 mb-1">
                  Confirm Password
                </label>
                <input
                  id="register-confirm"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-cream/20 bg-brown-deep text-gold focus:ring-gold/40 focus:ring-offset-0 accent-[#E8A020]"
                />
                <span className="text-xs text-cream/50 leading-relaxed">
                  I confirm that I am at least 13 years old and agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-gold/80">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-gold/80">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange hover:bg-orange-hover text-cream font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<ModalContent onClose={onClose} />, document.body);
}
