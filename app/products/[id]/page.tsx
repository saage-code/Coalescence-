import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts, getSettings, parseSizes, productImages } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import ProductDetail from "@/components/ProductDetail";
import SignupBand from "@/components/SignupBand";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

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
  // The description field holds paragraphs separated by blank lines, so collapse
  // whitespace before it goes in a meta tag — otherwise the newlines end up in
  // the tag verbatim.
  const summary = product.description.replace(/\s+/g, " ").trim();
  return {
    title: `${product.name} — ${settings.brandName}`,
    description: summary.slice(0, 160) || settings.tagline,
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
  const images = productImages(product);
  const sizes = parseSizes(product.sizes);
  const related = getProducts()
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    // productTheme decides the surface; the class swaps the colour variables
    // that everything below reads from.
    <div className={surface === "dark" ? "theme-dark" : undefined}>
      <SiteHeader settings={settings} />

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

      <SignupBand />
      <SiteFooter settings={settings} />
    </div>
  );
}
