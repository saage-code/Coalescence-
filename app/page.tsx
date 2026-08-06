import Link from "next/link";
import { getProducts, getSettings } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import LockScreen from "@/components/LockScreen";
import SignupForm from "@/components/SignupForm";

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

  return (
    <div>
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

      {settings.announcement && (
        <div
          className="border-b py-2 px-4 text-center text-[11px] tracking-[0.35em] uppercase"
          style={{ borderColor: "var(--line)", color: "var(--muted)" }}
        >
          {settings.announcement}
        </div>
      )}

      <header className="flex items-center justify-between px-6 sm:px-10 py-5">
        <span className="font-display text-lg tracking-[0.25em] uppercase">{settings.brandName}</span>
        <nav className="flex items-center gap-6 text-[11px] tracking-[0.25em] uppercase" style={{ color: "var(--muted)" }}>
          <a href="#shop" className="hover:text-accent transition-colors">Shop</a>
          <a href="#about" className="hover:text-accent transition-colors">About</a>
          {settings.instagram && (
            <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">
              Instagram
            </a>
          )}
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative px-6 sm:px-10 pt-16 pb-24 sm:pt-24 sm:pb-32 overflow-hidden">
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
            <p className="text-[11px] tracking-[0.45em] uppercase" style={{ color: "var(--muted)" }}>{settings.tagline}</p>
            <h1 className="font-display mt-6 text-5xl sm:text-7xl md:text-8xl font-medium tracking-tight whitespace-pre-line">
              {settings.heroHeadline}
            </h1>
            <a
              href="#shop"
              className="btn-ghost inline-block mt-10 rounded-full px-8 py-3 text-[11px] tracking-[0.35em] uppercase"
            >
              View the drop
            </a>
          </div>
        </section>

        {/* Products */}
        <section id="shop" className="px-6 sm:px-10 pb-24">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight">The drop</h2>
            <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--muted)" }}>
              {products.length} piece{products.length === 1 ? "" : "s"}
            </span>
          </div>

          {products.length === 0 ? (
            <div
              className="border border-dashed rounded-2xl py-20 text-center text-sm"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              Nothing here yet — add pieces from the admin panel.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const card = (
                  <article
                    key={p.id}
                    className="group border rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[rgba(0,0,0,0.03)]">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-4xl opacity-10 tracking-widest uppercase">
                            {settings.brandName}
                          </span>
                        </div>
                      )}
                      {p.tag && !p.soldOut && (
                        <span className="absolute top-3 left-3 bg-accent text-white text-[10px] font-semibold tracking-[0.2em] uppercase rounded-full px-3 py-1">
                          {p.tag}
                        </span>
                      )}
                      {p.soldOut && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="border rounded-full px-4 py-1.5 text-[11px] tracking-[0.3em] uppercase" style={{ borderColor: "var(--ink)" }}>
                            Sold out
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-4 py-4">
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-sm" style={{ color: "var(--muted)" }}>{p.price}</span>
                    </div>
                  </article>
                );
                // Cards open the product page, which is where the buy link now
                // lives, alongside sizes, gallery and description.
                return (
                  <Link key={p.id} href={`/products/${p.id}`} className="block">
                    {card}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* About */}
        {settings.about && (
          <section id="about" className="px-6 sm:px-10 pb-24">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-[11px] tracking-[0.45em] uppercase" style={{ color: "var(--muted)" }}>About</p>
              <p className="font-display mt-6 text-xl sm:text-2xl leading-relaxed tracking-tight">
                {settings.about}
              </p>
            </div>
          </section>
        )}

        {/* Footer signup */}
        <section className="border-t px-6 sm:px-10 py-20" style={{ borderColor: "var(--line)" }}>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight">Never miss a drop</h2>
            <p className="mt-3 mb-8 text-sm" style={{ color: "var(--muted)" }}>
              Email or SMS — your choice. No spam, only drops.
            </p>
            <SignupForm compact />
          </div>
        </section>
      </main>

      <footer
        className="flex flex-col sm:flex-row gap-3 items-center justify-between px-6 sm:px-10 py-8 border-t text-[11px] tracking-[0.2em] uppercase"
        style={{ borderColor: "var(--line)", color: "var(--muted)" }}
      >
        <span>© {new Date().getFullYear()} {settings.brandName}</span>
        <div className="flex gap-5">
          {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-accent">Instagram</a>}
          {settings.tiktok && <a href={settings.tiktok} target="_blank" rel="noreferrer" className="hover:text-accent">TikTok</a>}
          {settings.contactEmail && <a href={`mailto:${settings.contactEmail}`} className="hover:text-accent">Contact</a>}
        </div>
      </footer>
    </div>
  );
}
