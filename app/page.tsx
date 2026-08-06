import Link from "next/link";
import { getProducts, getSettings } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import LockScreen from "@/components/LockScreen";
import SignupBand from "@/components/SignupBand";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = getSettings();
  const admin = await isAdmin();

  // Locked store: customers only ever see the email/SMS signup.
  // The admin still sees the real site (with a banner) so they can work on it.
  if (settings.locked && !admin) {
    return <LockScreen settings={settings} />;
  }

  const products = getProducts();
  const surface = settings.productTheme;

  return (
    // Same surface setting as the product page, so moving between them doesn't
    // jump from light to dark.
    <div className={surface === "dark" ? "theme-dark" : undefined}>
      {admin && (
        <div className="bg-accent text-white text-xs font-medium tracking-wide text-center py-2 px-4">
          {settings.locked
            ? "STORE IS LOCKED — customers only see the signup page. You see the full site because you're the admin."
            : "Admin preview — you're logged in."}{" "}
          <Link href="/admin" className="underline underline-offset-2">
            Open admin
          </Link>
        </div>
      )}

      {/* No announcement strip — the page opens on the gradient bar. Note this
          leaves settings.announcement with nowhere to render, here or on the
          product page. */}
      <SiteHeader settings={settings} />

      <main>
        {/* Hero */}
        <section className="relative px-6 sm:px-10 pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
          {settings.heroImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.heroImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-25"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, transparent, var(--bg))" }}
              />
            </>
          )}
          <div className="relative max-w-4xl">
            {/* Tagline isn't shown above the headline any more. The field still
                works — it's the site's meta description in app/layout.tsx.
                Script, not the subset brush face: the headline is admin-typed,
                and the subsets would claim the odd letter mid-word. */}
            <h1 className="font-script text-5xl sm:text-7xl lg:text-8xl leading-[1.02] whitespace-pre-line">
              {settings.heroHeadline}
            </h1>
            <div className="mt-10 max-w-xs">
              <a href="#shop" className="btn-brand font-hand text-lg">
                View the drop
              </a>
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="shop" className="px-6 sm:px-10 pb-24">
          <div className="flex items-baseline justify-between gap-4 mb-8">
            <h2 className="font-script text-3xl sm:text-4xl">Dreams Collection</h2>
            <span
              className="font-hand text-[11px] tracking-[0.25em] uppercase shrink-0"
              style={{ color: "var(--muted)" }}
            >
              {products.length} piece{products.length === 1 ? "" : "s"}
            </span>
          </div>

          {products.length === 0 ? (
            <div
              className="border border-dashed py-20 text-center text-sm"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              Nothing here yet — add pieces from the admin panel.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {products.map((p) => (
                // Cards open the product page, which is where the buy link lives,
                // alongside sizes, gallery and description.
                <Link key={p.id} href={`/products/${p.id}`} className="group block">
                  <div className="photo-surface relative aspect-[4/5] overflow-hidden">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-script text-3xl opacity-20">{settings.brandName}</span>
                      </div>
                    )}
                    {p.tag && !p.soldOut && (
                      <span className="badge-ink font-hand absolute top-3 left-3 text-[10px] tracking-[0.2em] uppercase px-3 py-1.5">
                        {p.tag}
                      </span>
                    )}
                    {p.soldOut && (
                      <div className="soldout-veil absolute inset-0 flex items-center justify-center">
                        <span
                          className="font-hand border-2 px-4 py-1.5 text-[11px] tracking-[0.25em] uppercase"
                          style={{ borderColor: "var(--ink)" }}
                        >
                          Sold out
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <span className="text-sm">{p.name}</span>
                    <span className="text-sm shrink-0" style={{ color: "var(--muted)" }}>
                      {p.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* About */}
        {settings.about && (
          <section id="about" className="px-6 sm:px-10 pb-24">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-script text-3xl sm:text-4xl">About</h2>
              {/* Body copy stays in the plain face — the script is for display
                  sizes, and a paragraph of it is hard going. */}
              <p className="mt-5 text-base sm:text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
                {settings.about}
              </p>
            </div>
          </section>
        )}
      </main>

      <SignupBand />
      <SiteFooter settings={settings} />
    </div>
  );
}
