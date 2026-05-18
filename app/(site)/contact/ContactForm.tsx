/**
 * app/(site)/contact/ContactForm.tsx — Contact form
 *
 * Features:
 * - Subject selector: General / Prayer Request / Other
 * - Name, Email, Message fields
 * - Honeypot anti-spam field (hidden from real users, filled by bots)
 * - Loading, success, and error states
 *
 * SECURITY — Honeypot:
 * The "website" field is hidden via CSS (not display:none, which some bots detect).
 * Real users never see it. Bots that autofill forms will fill it in.
 * The server rejects any submission where this field has a value.
 *
 * Note: We use aria-hidden and tabIndex=-1 on the honeypot so screen readers
 * and keyboard users don't encounter it.
 */
"use client";

import { useState } from "react";

type FormData = {
  name: string;
  email: string;
  subject: "general" | "prayer" | "other";
  message: string;
  website: string; // honeypot — must stay empty
};

const initialForm: FormData = {
  name: "",
  email: "",
  subject: "general",
  message: "",
  website: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [responseMessage, setResponseMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setResponseMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setResponseMessage(data.message);
        setForm(initialForm);
      } else {
        setStatus("error");
        setResponseMessage(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setResponseMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className="bg-gold/10 border border-gold/30 rounded-2xl p-8 text-center"
        role="alert"
        aria-live="polite"
      >
        <div className="text-gold text-3xl mb-3" aria-hidden="true">
          <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-serif text-xl font-bold text-brown mb-2">
          {form.subject === "prayer" ? "Praying for you." : "Message received!"}
        </p>
        <p className="text-brown/70">{responseMessage}</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-orange underline hover:text-orange-hover transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white rounded-2xl border border-brown/[0.08] shadow-card p-8"
      noValidate
    >
      {/* Honeypot — hidden from real users, should always be empty */}
      {/* Using opacity-0/height-0 is harder for bots to detect than display:none */}
      <div
        aria-hidden="true"
        style={{ opacity: 0, height: 0, overflow: "hidden", position: "absolute" }}
      >
        <label htmlFor="website">Website (leave blank)</label>
        <input
          type="text"
          id="website"
          name="website"
          value={form.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-brown mb-1.5"
        >
          What can we help with?
        </label>
        <select
          id="subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-brown/20 bg-white text-brown text-sm focus:outline-none focus:border-orange focus:ring-0 transition-colors duration-150"
        >
          <option value="general">General question</option>
          <option value="prayer">Prayer request</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-brown mb-1.5"
        >
          Your name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          maxLength={100}
          autoComplete="name"
          className="w-full px-4 py-3 rounded-xl border-2 border-brown/20 bg-white text-brown text-sm focus:outline-none focus:border-orange focus:ring-0 transition-colors duration-150"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-brown mb-1.5"
        >
          Email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          maxLength={254}
          autoComplete="email"
          className="w-full px-4 py-3 rounded-xl border-2 border-brown/20 bg-white text-brown text-sm focus:outline-none focus:border-orange focus:ring-0 transition-colors duration-150"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-brown mb-1.5"
        >
          {form.subject === "prayer" ? "Your prayer request" : "Your message"}
        </label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className="w-full px-4 py-3 rounded-xl border-2 border-brown/20 bg-white text-brown text-sm focus:outline-none focus:border-orange focus:ring-0 resize-none transition-colors duration-150"
          placeholder={
            form.subject === "prayer"
              ? "Share your prayer request. We will pray for you personally."
              : "How can we help?"
          }
        />
        <p className="text-xs text-brown/40 mt-1 text-right">
          {form.message.length}/2000
        </p>
      </div>

      {/* Error message */}
      {status === "error" && (
        <p className="text-red-600 text-sm text-center" role="alert">
          {responseMessage}
        </p>
      )}

      {/* Submit — fixed width, left-aligned, matches navbar "Give" button style */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto sm:min-w-[200px] bg-orange hover:bg-orange-hover disabled:opacity-60 text-cream font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-[0_4px_16px_rgba(196,94,26,0.25)] hover:shadow-[0_6px_22px_rgba(196,94,26,0.35)] hover:-translate-y-0.5"
        >
          {status === "loading"
            ? "Sending…"
            : form.subject === "prayer"
            ? "Submit Prayer Request"
            : "Send Message"}
        </button>
        <p className="text-xs text-brown/40 sm:text-left">
          We typically respond within 1-2 business days.
        </p>
      </div>
    </form>
  );
}
