import Link from "next/link";
import type { SiteSettings } from "@/lib/db";

// Inline so there's no icon dependency and no extra request, and stroked in
// currentColor so they take the bar's ink.
function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="30"
      height="30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.8 20c0-3.5 3.2-5.9 7.2-5.9s7.2 2.4 7.2 5.9" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="30"
      height="30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* Straight sides, not tapered — a taper reads as a trash can. The handle
          is a single wide curve at 61% of the body width; drawn with vertical
          stubs into an arc instead, it reads as a padlock shackle. */}
      <path d="M5.4 7.6h13.2v11.4a1.9 1.9 0 0 1-1.9 1.9H7.3a1.9 1.9 0 0 1-1.9-1.9V7.6Z" />
      <path d="M8 7.6c0-2.35 1.79-4.25 4-4.25s4 1.9 4 4.25" />
    </svg>
  );
}

/**
 * The gradient bar every storefront page opens on. Shared so the homepage and
 * the product page can't drift apart.
 *
 * Neither icon is backed by a feature — this project has no accounts and no
 * cart — so each points at the nearest real destination rather than sitting
 * dead: the person icon at contact, the bag at the product grid.
 */
export default function SiteHeader({ settings }: { settings: SiteSettings }) {
  const accountHref = settings.contactEmail
    ? `mailto:${settings.contactEmail}`
    : settings.instagram || "/#about";
  const contactLabel = settings.contactEmail ? "Contact us" : "Find us";

  return (
    <header className="brand-bar flex items-center justify-between gap-4 px-6 sm:px-10 py-5">
      <Link href="/" aria-label={settings.brandName} className="shrink-0">
        {settings.lockLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.lockLogo} alt={settings.brandName} className="h-6 sm:h-8 w-auto" />
        ) : (
          <span className="font-script text-2xl">{settings.brandName}</span>
        )}
      </Link>
      <nav className="flex items-center gap-1 sm:gap-2">
        <a
          href={accountHref}
          {...(accountHref.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          aria-label={contactLabel}
          title={contactLabel}
          className="icon-btn"
        >
          <PersonIcon />
        </a>
        <Link href="/#shop" aria-label="Shop all pieces" title="Shop all pieces" className="icon-btn">
          <BagIcon />
        </Link>
      </nav>
    </header>
  );
}
