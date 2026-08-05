"use client";

import { useState } from "react";

type Props = {
  /** Lay the fields out in a row (storefront footer). */
  compact?: boolean;
  /** Show this button first; the form appears when it's clicked. */
  revealLabel?: string;
  /** "lock" = black-on-gradient marker styling for the lock screen. */
  theme?: "light" | "lock";
  /** Drop the email field and collect SMS only, as a single inline bar. */
  smsOnly?: boolean;
};

// Email + SMS capture used on the lock screen and in the storefront footer.
export default function SignupForm({
  compact = false,
  revealLabel,
  theme = "light",
  smsOnly = false,
}: Props) {
  const [open, setOpen] = useState(!revealLabel);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const lock = theme === "lock";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    // With no email field on screen, the API's "email or phone" wording would
    // be confusing, so ask for the one field there actually is.
    if (smsOnly && !phone.trim()) {
      setMessage("Enter a phone number.");
      setState("error");
      return;
    }
    setState("busy");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Something went wrong. Try again.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setMessage("Something went wrong. Try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="text-center">
        <p className={lock ? "font-marker text-3xl" : "font-display text-2xl tracking-wide"}>
          You&apos;re on the list!
        </p>
        <p className="mt-2 text-sm" style={{ color: lock ? "rgba(0,0,0,0.65)" : "var(--muted)" }}>
          Stay tuned for future updates.
        </p>
      </div>
    );
  }

  // Collapsed: just the outlined button, which opens the form when clicked.
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-lock font-marker"
      >
        {revealLabel}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className={smsOnly ? "sms-bar-form" : "w-full max-w-md mx-auto"}>
      <div
        className={
          smsOnly || compact ? "flex flex-col sm:flex-row gap-3" : "flex flex-col gap-3"
        }
      >
        {!smsOnly && (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className={lock ? "field field-lock" : "field"}
            autoComplete="email"
            autoFocus={Boolean(revealLabel)}
          />
        )}
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={smsOnly ? "Phone number" : "Phone number (for SMS)"}
          className={`${lock ? "field field-lock" : "field"}${smsOnly ? " flex-1 min-w-0" : ""}`}
          autoComplete="tel"
          autoFocus={Boolean(revealLabel) && smsOnly}
        />
        <button
          type="submit"
          disabled={state === "busy"}
          className={
            lock
              ? "font-marker text-xl tracking-wide bg-black text-white px-6 py-3 transition-opacity hover:opacity-80 disabled:opacity-50 whitespace-nowrap"
              : "bg-accent text-white font-medium text-sm tracking-widest uppercase rounded-lg px-6 py-3 transition-opacity hover:opacity-85 disabled:opacity-50 whitespace-nowrap"
          }
        >
          {state === "busy" ? "Joining…" : lock ? "JOIN" : "Notify me"}
        </button>
      </div>
      {state === "error" && (
        <p
          className="mt-3 text-sm text-center"
          style={{ color: lock ? "#7f1d1d" : "#dc2626" }}
        >
          {message}
        </p>
      )}
      <p
        className="mt-3 text-[11px] leading-relaxed text-center"
        style={{ color: lock ? "rgba(0,0,0,0.6)" : "var(--muted)" }}
      >
        {smsOnly ? (
          <>
            By signing up you agree to receive occasional drop announcements by SMS. Msg &amp;
            data rates may apply. Unsubscribe anytime.
          </>
        ) : (
          <>
            Enter an email, a phone number, or both. By signing up you agree to receive
            occasional drop announcements by email or SMS. Msg &amp; data rates may apply.
            Unsubscribe anytime.
          </>
        )}
      </p>
    </form>
  );
}
