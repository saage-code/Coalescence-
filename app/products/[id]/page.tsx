import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts, getSettings, logoFor, parseSizes, productImages } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import ProductDetail from "@/components/ProductDetail";
import SignupForm from "@/components/SignupForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  const settings = getSettings();
  if (!product) return { title: `Not found — ${settings.brandName}` };
  return {
    title: `${product.name} — ${settings.brandName}`,
    description: product.description.slice(0, 160) || settings.tagline,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const settings = getSettings();
  const admin = await isAdmin();

  // While the store is locked, customers get the lock screen and nothing else —
  // a product URL must not be a way around it. The admin still sees the page so
  // the shop can be built out before opening.
  if (settings.locked && !admin) notFound();

  const product = getProduct(id);
  if (!product) notFound();

  const surface = settings.productTheme;
  const headerLogo = logoFor(settings, surface);
  const images = productImages(product);
  const sizes = parseSizes(product.sizes);
  const related = getProducts()
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    // productTheme decides the surface; the class swaps the colour variables
    // that everything below reads from.
    <div className={surface === "dark" ? "theme-dark" : undefined}>
      {/* No announcement bar here by choice — the page opens on the wordmark.
          The storefront still shows settings.announcement above its header. */}
      <header
        className="flex items-center justify-between gap-4 px-6 sm:px-10 py-5 border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <Link href="/" aria-label={settings.brandName} className="shrink-0">
          {headerLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={headerLogo} alt={settings.brandName} className="h-6 sm:h-8 w-auto" />
          ) : (
            <span className="font-script text-2xl">{settings.brandName}</span>
          )}
        </Link>
        <nav
          className="flex items-center gap-5 sm:gap-7 text-[11px] tracking-[0.25em] uppercase"
          style={{ color: "var(--muted)" }}
        >
          <Link href="/#shop" className="hover:text-accent transition-colors">
            Shop
          </Link>
          <Link href="/#about" className="hover:text-accent transition-colors">
            About
          </Link>
          {settings.instagram && (
            <a
              href={settings.instagram}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline hover:text-accent transition-colors"
            >
              Instagram
            </a>
          )}
        </nav>
      </header>

      <main className="px-6 sm:px-10 py-8 sm:py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 text-[11px] tracking-[0.2em] uppercase"
          style={{ color: "var(--muted)" }}
        >
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/#shop" className="hover:text-accent">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span style={{ color: "var(--ink)" }}>{product.name}</span>
        </nav>

        {/* Only the three fields ProductDetail declares. Passing the whole
            settings object type-checks, but it's a client component, so every
            other field would be serialised into the page payload for nothing. */}
        <ProductDetail
          product={product}
          images={images}
          sizes={sizes}
          settings={{
            brandName: settings.brandName,
            contactEmail: settings.contactEmail,
            instagram: settings.instagram,
          }}
        />

        {related.length > 0 && (
          <section className="mt-20 sm:mt-28">
            <h2 className="font-script text-3xl sm:text-4xl">More from the drop</h2>
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
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
                        <span className="font-script text-2xl opacity-20">{settings.brandName}</span>
                      </div>
                    )}
                    {p.soldOut && (
                      <div className="soldout-veil absolute inset-0 flex items-center justify-center">
                        <span
                          className="font-hand border-2 px-3 py-1 text-[10px] tracking-[0.25em] uppercase"
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
          </section>
        )}
      </main>

      {/* Signup band, in the lock screen's gradient so the two read as one brand */}
      <section id="keep-in-touch" className="brand-gradient px-6 sm:px-10 py-16 sm:py-20 text-black">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-script text-3xl sm:text-4xl">Never miss a drop</h2>
          <p className="mt-3 mb-8 text-sm" style={{ color: "rgba(0,0,0,0.7)" }}>
            Drops are announced by SMS first. No spam, only drops.
          </p>
          {/* theme="lock" because this band is the same gradient as the lock
              screen — the light theme's muted grey is meant for white and goes
              nearly illegible here. */}
          <SignupForm compact theme="lock" />
        </div>
      </section>

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
    </div>
  );
}
