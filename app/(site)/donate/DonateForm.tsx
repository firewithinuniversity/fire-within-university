/**
 * app/(site)/donate/DonateForm.tsx — Interactive donation form
 *
 * Client Component handling all the interactive state:
 * - Tab: "Give Once" vs "Give Monthly"
 * - Preset amount buttons ($10, $25, $50, $100)
 * - Custom amount input
 * - Form submission → API call → Stripe redirect
 *
 * FLOW:
 * 1. User selects amount and frequency
 * 2. On submit, POST to /api/stripe/checkout with amountCents + frequency
 * 3. API returns a Stripe Checkout URL
 * 4. Browser redirects to that URL (Stripe's hosted page)
 * 5. After payment, Stripe redirects back to /thank-you
 *
 * SECURITY:
 * - Amount is validated AGAIN on the server in the API route
 * - We never send card data anywhere — Stripe handles all of that
 * - The $10 minimum is enforced both here and on the server
 */
"use client";

import { useState } from "react";

type Frequency = "once" | "monthly";

const PRESET_AMOUNTS_DOLLARS = [10, 25, 50, 100];
const MIN_CUSTOM_DOLLARS = 10;

export default function DonateForm() {
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [selectedAmount, setSelectedAmount] = useState<number>(25); // default $25
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Determine the final amount in dollars
  const finalAmountDollars = isCustom
    ? parseFloat(customAmount) || 0
    : selectedAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation (server validates too — this is just for UX)
    if (finalAmountDollars < MIN_CUSTOM_DOLLARS) {
      setError(`Minimum donation is $${MIN_CUSTOM_DOLLARS}.`);
      return;
    }

    const amountCents = Math.round(finalAmountDollars * 100);

    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents, frequency }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Redirect to Stripe's hosted checkout page
        window.location.href = data.url;
      } else {
        setError(data.message ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-brown-card/70 rounded-2xl border border-white/[0.06] overflow-hidden"
    >
      {/* ── Frequency tabs ─────────────────────────────────────────── */}
      <div className="flex border-b border-cream/[0.06]">
        {(["once", "monthly"] as Frequency[]).map((freq) => (
          <button
            key={freq}
            type="button"
            onClick={() => setFrequency(freq)}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              frequency === freq
                ? "bg-orange text-cream"
                : "text-cream/50 hover:bg-cream/[0.05]"
            }`}
          >
            {freq === "once" ? "Give Once" : "Give Monthly"}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* Monthly encouragement text */}
        {frequency === "monthly" && (
          <p className="text-sm text-gold/80 text-center bg-gold/[0.06] rounded-lg py-2 px-3">
            Monthly giving provides sustainable support for the ministry.
          </p>
        )}

        {/* ── Preset amount buttons ──────────────────────────────── */}
        <div>
          <p className="text-sm font-medium text-cream/50 mb-3">
            Select an amount
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_AMOUNTS_DOLLARS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount);
                  setIsCustom(false);
                  setCustomAmount("");
                }}
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                  !isCustom && selectedAmount === amount
                    ? "border-orange bg-orange text-cream"
                    : "border-cream/[0.15] text-cream/70 hover:border-gold hover:text-gold"
                }`}
                aria-pressed={!isCustom && selectedAmount === amount}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        {/* ── Custom amount input ────────────────────────────────── */}
        <div>
          <p className="text-sm font-medium text-cream/50 mb-2">
            Or enter a custom amount
          </p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40 font-medium">
              $
            </span>
            <input
              type="number"
              min={MIN_CUSTOM_DOLLARS}
              max={1000}
              step="1"
              placeholder="Other amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setIsCustom(true);
              }}
              onFocus={() => setIsCustom(true)}
              className={`w-full pl-8 pr-4 py-3 rounded-xl border-2 bg-brown-deep text-cream text-sm focus:outline-none transition-colors placeholder:text-cream/35 ${
                isCustom
                  ? "border-gold"
                  : "border-cream/[0.1] focus:border-gold"
              }`}
              aria-label="Custom donation amount in dollars"
            />
          </div>
          <p className="text-xs text-cream/40 mt-1">
            Minimum ${MIN_CUSTOM_DOLLARS}
          </p>
        </div>

        {/* ── Summary ───────────────────────────────────────────── */}
        <div className="bg-brown-deep/60 rounded-2xl p-5 text-center border border-gold/[0.15]">
          <p className="text-sm text-cream/50">
            {frequency === "once" ? "One-time gift of" : "Monthly gift of"}
          </p>
          <p className="font-serif text-4xl font-bold text-cream mt-1">
            ${finalAmountDollars > 0 ? finalAmountDollars.toFixed(0) : "—"}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-sm text-center" role="alert">
            {error}
          </p>
        )}

        {/* ── Submit button ──────────────────────────────────────── */}
        <button
          type="submit"
          disabled={loading || finalAmountDollars < MIN_CUSTOM_DOLLARS}
          className="w-full bg-orange hover:bg-orange-hover disabled:opacity-60 text-cream font-semibold py-4 rounded-2xl transition-all duration-200 text-base hover:shadow-md hover:-translate-y-0.5"
        >
          {loading
            ? "Redirecting to secure checkout…"
            : `Give $${finalAmountDollars > 0 ? finalAmountDollars.toFixed(0) : "—"} ${frequency === "monthly" ? "/ month" : ""}`}
        </button>

        <p className="text-xs text-cream/40 text-center">
          🔒 Secure checkout powered by Stripe. We never store your card information.
        </p>
      </div>
    </form>
  );
}
