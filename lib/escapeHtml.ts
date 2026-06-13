/**
 * lib/escapeHtml.ts — entity-encode user-supplied strings before interpolating
 * them into HTML email bodies.
 *
 * Entity-encode (not strip) — regex-based tag removal is bypassable. Email
 * clients don't execute JS, but unescaped input can still smuggle misleading
 * markup or phishing links into a message the team trusts. Used by the contact
 * route and the Stripe webhook (donor name/email come from user-controlled
 * Checkout fields).
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
