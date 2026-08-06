"use client";

import { useState } from "react";
import type { Product, SiteSettings } from "@/lib/db";

type Props = {
  product: Product;
  images: string[];
  sizes: string[];
  settings: Pick<SiteSettings, "brandName" | "contactEmail" | "instagram">;
};

/**
 * There is no cart or checkout in this project (by design — see the README), so
 * the primary action hands off to the product's own buy link, carrying the
 * chosen size and quantity as query params. Stripe/PayPal links ignore unknown
 * params, and a link that isn't an absolute URL is passed through untouched.
 */
function buyHref(base: string, size: string, qty: number): string {
  try {
    const url = new URL(base);
    if (size) url.searchParams.set("size", size);
    if (qty > 1) url.searchParams.set("qty", String(qty));
    return url.toString();
  } catch {
    return base;
  }
}

export default function ProductDetail({ product, images, sizes, settings }: Props) {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);

  const needsSize = sizes.length > 0 && !size;
  const lead = images[active] ?? images[0] ?? "";

  // Fallback path when no buy link is set: ask about the piece by email, then
  // Instagram. Both prefill what the customer picked so the message is useful.
  const subject = `${product.name}${size ? ` — size ${size}` : ""}`;
  const askHref = settings.contactEmail
    ? `mailto:${settings.contactEmail}?subject=${encodeURIComponent(subject)}`
    : settings.instagram || "";

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
      {/* Gallery */}
      <div className="flex flex-col gap-4">
        <div
          className="relative aspect-[4/5] overflow-hidden"
          style={{ background: "rgba(0,0,0,0.04)" }}
        >
          {lead ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lead} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-script text-5xl opacity-20">{settings.brandName}</span>
            </div>
          )}

          {product.tag && !product.soldOut && (
            <span className="font-hand absolute top-4 left-4 bg-black text-white text-xs tracking-[0.2em] uppercase px-3 py-1.5">
              {product.tag}
            </span>
          )}
          {product.soldOut && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="font-hand border-2 border-black px-5 py-2 text-sm tracking-[0.3em] uppercase">
                Sold out
              </span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={`Photo ${i + 1} of ${images.length}`}
                className="thumb aspect-square overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <h1 className="font-script leading-[1.05] text-4xl sm:text-5xl lg:text-6xl">
          {product.name}
        </h1>

        <div className="mt-4 flex items-baseline gap-3">
          {product.price && <span className="text-2xl">{product.price}</span>}
          {product.compareAtPrice && (
            <span className="text-base line-through" style={{ color: "var(--muted)" }}>
              {product.compareAtPrice}
            </span>
          )}
        </div>

        {product.description && (
          <div className="mt-6 flex flex-col gap-3 text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
            {product.description.split(/\n\s*\n/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
        )}

        {sizes.length > 0 && (
          <div className="mt-8">
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] tracking-[0.25em] uppercase" style={{ color: "var(--muted)" }}>
                Size
              </span>
              {size && <span className="text-[11px] tracking-[0.2em] uppercase">— {size}</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={s === size}
                  disabled={product.soldOut}
                  className="chip"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {!product.soldOut && (
          <div className="mt-8">
            <span className="block text-[11px] tracking-[0.25em] uppercase" style={{ color: "var(--muted)" }}>
              Quantity
            </span>
            <div className="mt-3 inline-flex items-center border-2 border-black">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
                className="w-11 h-11 text-lg disabled:opacity-30"
              >
                −
              </button>
              <span aria-live="polite" className="w-10 text-center text-sm">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                disabled={qty >= 10}
                aria-label="Increase quantity"
                className="w-11 h-11 text-lg disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Call to action */}
        <div className="mt-8 flex flex-col gap-3">
          {product.soldOut ? (
            <>
              <button type="button" disabled className="btn-brand font-hand text-lg">
                Sold out
              </button>
              <a href="#keep-in-touch" className="btn-ink font-hand text-lg">
                Tell me when it&apos;s back
              </a>
            </>
          ) : product.buyUrl ? (
            needsSize ? (
              <button type="button" disabled className="btn-brand font-hand text-lg">
                Select a size
              </button>
            ) : (
              <a
                href={buyHref(product.buyUrl, size, qty)}
                target="_blank"
                rel="noreferrer"
                className="btn-brand font-hand text-lg"
              >
                Buy now
              </a>
            )
          ) : askHref ? (
            needsSize ? (
              <button type="button" disabled className="btn-brand font-hand text-lg">
                Select a size
              </button>
            ) : (
              <a
                href={askHref}
                target={settings.contactEmail ? undefined : "_blank"}
                rel="noreferrer"
                className="btn-brand font-hand text-lg"
              >
                Ask about this piece
              </a>
            )
          ) : (
            <a href="#keep-in-touch" className="btn-brand font-hand text-lg">
              Join the list
            </a>
          )}

          <p className="text-[11px] leading-relaxed text-center" style={{ color: "var(--muted)" }}>
            {product.soldOut
              ? "This one's gone — drops don't restock, but new pieces are announced by SMS first."
              : product.buyUrl
                ? "Checkout opens in a new tab. Cut and numbered in a small run."
                : "Ordering isn't wired up yet — get in touch and we'll sort it."}
          </p>
        </div>

        {/* Details rows */}
        <div className="mt-10">
          <details className="acc-row" open>
            <summary>The details</summary>
            <div className="pb-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              <ul className="flex flex-col gap-1.5">
                <li>Cut, printed and numbered in small runs.</li>
                {sizes.length > 0 && <li>Available in {sizes.join(", ")}.</li>}
                {product.tag && <li>{product.tag}.</li>}
                <li>Once a drop sells out, it&apos;s gone for good.</li>
              </ul>
            </div>
          </details>
          <details className="acc-row">
            <summary>Shipping &amp; returns</summary>
            <div className="pb-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Orders ship within 3–5 business days. Unworn pieces can be returned within
              14 days of delivery
              {settings.contactEmail ? (
                <>
                  {" "}
                  — email{" "}
                  <a href={`mailto:${settings.contactEmail}`} className="underline underline-offset-2">
                    {settings.contactEmail}
                  </a>{" "}
                  to start one.
                </>
              ) : (
                " — get in touch to start one."
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
