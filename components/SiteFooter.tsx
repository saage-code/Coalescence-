import type { SiteSettings } from "@/lib/db";

/** Shared storefront footer — socials and contact, on the page surface. */
export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer
      className="flex flex-col sm:flex-row gap-3 items-center justify-between px-6 sm:px-10 py-8 text-[11px] tracking-[0.2em] uppercase"
      style={{ color: "var(--muted)" }}
    >
      <span>
        © {new Date().getFullYear()} {settings.brandName}
      </span>
      <div className="flex gap-5">
        {settings.instagram && (
          <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-accent">
            Instagram
          </a>
        )}
        {settings.tiktok && (
          <a href={settings.tiktok} target="_blank" rel="noreferrer" className="hover:text-accent">
            TikTok
          </a>
        )}
        {settings.contactEmail && (
          <a href={`mailto:${settings.contactEmail}`} className="hover:text-accent">
            Contact
          </a>
        )}
      </div>
    </footer>
  );
}
