"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Product, SiteSettings, Signup } from "@/lib/db";
import LockLockup from "@/components/LockLockup";

type Props = {
  initialSettings: SiteSettings;
  initialProducts: Product[];
  initialSignups: Signup[];
  defaultPassword: boolean;
};

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="border rounded-2xl p-6" style={{ borderColor: "var(--line)" }}>
      <h2 className="font-display text-xl tracking-tight">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {subtitle}
        </p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block mb-1.5 text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
      {children}
    </span>
  );
}

// Uploads an image and hands back its URL.
function ImagePicker({
  value,
  onChange,
  onError,
}: {
  value: string;
  onChange: (url: string) => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File) {
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const data = await api<{ url: string }>("/api/admin/upload", { method: "POST", body: form });
      onChange(data.url);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        // Wide box and object-contain so a letterform wordmark stays readable
        // here instead of being cropped to a couple of glyphs.
        <img
          src={value}
          alt=""
          className="w-28 h-14 rounded-lg object-contain border p-1"
          style={{ borderColor: "var(--line)" }}
        />
      ) : (
        <div
          className="w-14 h-14 rounded-lg border border-dashed flex items-center justify-center text-lg"
          style={{ borderColor: "var(--line)", color: "var(--muted)" }}
        >
          +
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="border rounded-lg px-4 py-2 text-xs tracking-wider uppercase hover:border-accent transition-colors disabled:opacity-50"
          style={{ borderColor: "var(--line)" }}
        >
          {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg px-3 py-2 text-xs tracking-wider uppercase hover:text-red-600 transition-colors"
            style={{ color: "var(--muted)" }}
          >
            Remove
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) pick(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

const MAX_GALLERY = 8;

// Extra product-page photos. Same upload endpoint as ImagePicker, but appends to
// a list and lets each shot be reordered or removed.
function GalleryPicker({
  value,
  onChange,
  onError,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function add(files: FileList) {
    setBusy(true);
    try {
      const room = MAX_GALLERY - value.length;
      const picked = Array.from(files).slice(0, Math.max(0, room));
      const urls: string[] = [];
      for (const file of picked) {
        const form = new FormData();
        form.append("file", file);
        const data = await api<{ url: string }>("/api/admin/upload", { method: "POST", body: form });
        urls.push(data.url);
      }
      if (urls.length) onChange([...value, ...urls]);
      if (files.length > picked.length) onError(`Gallery holds ${MAX_GALLERY} photos — the rest were skipped.`);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((src, i) => (
            <div key={src} className="flex flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="w-20 h-20 rounded-lg object-cover border"
                style={{ borderColor: "var(--line)" }}
              />
              <div className="flex items-center justify-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="px-1 disabled:opacity-20" title="Move left">
                  ←
                </button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} className="px-1 disabled:opacity-20" title="Move right">
                  →
                </button>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  className="px-1 hover:text-red-600"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || value.length >= MAX_GALLERY}
          className="border rounded-lg px-4 py-2 text-xs tracking-wider uppercase hover:border-accent transition-colors disabled:opacity-50"
          style={{ borderColor: "var(--line)" }}
        >
          {busy ? "Uploading…" : value.length >= MAX_GALLERY ? `Gallery full (${MAX_GALLERY})` : "Add photos"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) add(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  price: "",
  compareAtPrice: "",
  image: "",
  gallery: [],
  tag: "",
  description: "",
  sizes: "",
  buyUrl: "",
  soldOut: false,
};

function ProductForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  onError,
}: {
  initial: Omit<Product, "id">;
  onSubmit: (draft: Omit<Product, "id">) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
  onError: (message: string) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Omit<Product, "id">>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label>
          <Label>Name *</Label>
          <input className="field" value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Heavyweight Tee — Bone" />
        </label>
        <label>
          <Label>Price</Label>
          <input className="field" value={draft.price} onChange={(e) => set({ price: e.target.value })} placeholder="$45" />
        </label>
        <label>
          <Label>Was-price (optional — shown struck through)</Label>
          <input className="field" value={draft.compareAtPrice} onChange={(e) => set({ compareAtPrice: e.target.value })} placeholder="$60" />
        </label>
        <label>
          <Label>Badge (optional)</Label>
          <input className="field" value={draft.tag} onChange={(e) => set({ tag: e.target.value })} placeholder="New / 1 of 50 / Last one" />
        </label>
        <label>
          <Label>Sizes (optional — comma separated)</Label>
          <input className="field" value={draft.sizes} onChange={(e) => set({ sizes: e.target.value })} placeholder="S, M, L, XL" />
        </label>
        <label className="sm:col-span-2">
          <Label>Buy link (optional)</Label>
          <input className="field" value={draft.buyUrl} onChange={(e) => set({ buyUrl: e.target.value })} placeholder="Stripe / PayPal / DM link" />
        </label>
      </div>
      <label>
        <Label>Description (optional — shown on the product page)</Label>
        <textarea
          className="field"
          rows={4}
          value={draft.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder={"Heavyweight 320gsm cotton, boxy fit.\n\nLeave a blank line to start a new paragraph."}
        />
      </label>
      <div>
        <Label>Main photo</Label>
        <ImagePicker value={draft.image} onChange={(image) => set({ image })} onError={onError} />
      </div>
      <div>
        <Label>More photos (optional — product page gallery, up to 8)</Label>
        <GalleryPicker value={draft.gallery} onChange={(gallery) => set({ gallery })} onError={onError} />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={draft.soldOut} onChange={(e) => set({ soldOut: e.target.checked })} className="accent-[var(--accent)]" />
        Sold out
      </label>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={busy || !draft.name.trim()}
          onClick={async () => {
            setBusy(true);
            try {
              await onSubmit(draft);
            } finally {
              setBusy(false);
            }
          }}
          className="bg-accent text-white font-medium text-xs tracking-widest uppercase rounded-lg px-5 py-2.5 hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs tracking-widest uppercase px-3"
            style={{ color: "var(--muted)" }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard({ initialSettings, initialProducts, initialSignups, defaultPassword }: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [products, setProducts] = useState(initialProducts);
  const [signups] = useState(initialSignups);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function flashError(message: string) {
    setError(message);
    setTimeout(() => setError(""), 5000);
  }

  const set = (patch: Partial<SiteSettings>) => setSettings((s) => ({ ...s, ...patch }));

  async function saveSettings(patch?: Partial<SiteSettings>) {
    setSavingSettings(true);
    try {
      const next = await api<SiteSettings>("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, ...patch }),
      });
      setSettings(next);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (e) {
      flashError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingSettings(false);
    }
  }

  async function productAction(body: Record<string, unknown>) {
    try {
      setProducts(
        await api<Product[]>("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      );
      return true;
    } catch (e) {
      flashError(e instanceof Error ? e.message : "Something went wrong");
      return false;
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.45em] uppercase" style={{ color: "var(--muted)" }}>
            {settings.brandName}
          </p>
          <h1 className="font-display text-3xl tracking-tight mt-1">Admin</h1>
        </div>
        <div className="flex items-center gap-3 text-xs tracking-widest uppercase">
          <a href="/" className="border rounded-lg px-4 py-2 hover:border-accent transition-colors" style={{ borderColor: "var(--line)" }}>
            View site
          </a>
          <button onClick={logout} className="px-2 hover:text-red-600 transition-colors" style={{ color: "var(--muted)" }}>
            Log out
          </button>
        </div>
      </header>

      {defaultPassword && (
        <div className="mb-6 border border-yellow-500 bg-yellow-50 text-yellow-900 rounded-xl px-4 py-3 text-sm">
          You&apos;re using the default password (<code>admin</code>). Set <code>ADMIN_PASSWORD</code> in{" "}
          <code>.env.local</code> (or your host&apos;s environment settings) before going live.
        </div>
      )}

      {error && (
        <div className="mb-6 border border-red-400 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="grid gap-6">
        {/* Store lock */}
        <section
          className="border rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4"
          style={{ borderColor: settings.locked ? "var(--accent)" : "var(--line)" }}
        >
          <div>
            <h2 className="font-display text-xl tracking-tight">
              Store is{" "}
              <span className={settings.locked ? "text-accent" : ""}>{settings.locked ? "LOCKED" : "OPEN"}</span>
            </h2>
            <p className="mt-1 text-sm max-w-md" style={{ color: "var(--muted)" }}>
              {settings.locked
                ? "Customers only see the email/SMS signup page. Flip it back when you're ready to sell."
                : "Customers see the full store. Lock it when you're not actively selling."}
            </p>
          </div>
          <button
            onClick={() => saveSettings({ locked: !settings.locked })}
            disabled={savingSettings}
            className={`font-medium text-xs tracking-widest uppercase rounded-lg px-6 py-3 transition-opacity hover:opacity-85 disabled:opacity-50 ${
              settings.locked ? "bg-accent text-white" : "border"
            }`}
            style={settings.locked ? undefined : { borderColor: "var(--line)" }}
          >
            {settings.locked ? "Unlock store" : "Lock store"}
          </button>
        </section>

        {/* Lock screen design */}
        <Card
          title="Lock screen design"
          subtitle="What customers see while the store is locked. Preview it any time by locking the store — as the admin you still see the full site."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="sm:col-span-2">
              <Label>Logo image (optional — replaces the brand name text)</Label>
              <ImagePicker value={settings.lockLogo} onChange={(lockLogo) => set({ lockLogo })} onError={flashError} />
            </label>
            <label>
              <Label>Subtitle</Label>
              <input className="field" value={settings.lockHeadline} onChange={(e) => set({ lockHeadline: e.target.value })} placeholder="BRB" />
            </label>
            <label>
              <Label>Button label</Label>
              <input className="field" value={settings.lockButtonLabel} onChange={(e) => set({ lockButtonLabel: e.target.value })} placeholder="JOIN SMS" />
            </label>
            <label className="sm:col-span-2">
              <Label>Small text under the button</Label>
              <input className="field" value={settings.lockMessage} onChange={(e) => set({ lockMessage: e.target.value })} />
            </label>
            <p className="sm:col-span-2 text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Heads up: the brand fonts from the sticker artwork only include the characters it
              used — <strong>A C E L N O S</strong> for the wordmark and{" "}
              <strong>B I J M N O R S !</strong> for the subtitle and button. Anything else still
              shows up, but in the backup marker font, so mixed copy can look inconsistent. Check
              the preview after changing these.
            </p>
            <label>
              <Label>Background — top color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.lockGradientTop}
                  onChange={(e) => set({ lockGradientTop: e.target.value })}
                  className="w-10 h-10 rounded-lg border cursor-pointer bg-transparent"
                  style={{ borderColor: "var(--line)" }}
                />
                <input className="field" value={settings.lockGradientTop} onChange={(e) => set({ lockGradientTop: e.target.value })} />
              </div>
            </label>
            <label>
              <Label>Background — bottom color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.lockGradientBottom}
                  onChange={(e) => set({ lockGradientBottom: e.target.value })}
                  className="w-10 h-10 rounded-lg border cursor-pointer bg-transparent"
                  style={{ borderColor: "var(--line)" }}
                />
                <input className="field" value={settings.lockGradientBottom} onChange={(e) => set({ lockGradientBottom: e.target.value })} />
              </div>
            </label>
          </div>

          {/* Live preview of the lock screen */}
          <div className="mt-5">
            <Label>Preview</Label>
            <div
              className="rounded-xl border flex flex-col items-center justify-center text-black text-center px-4 py-10 overflow-hidden"
              style={{
                borderColor: "var(--line)",
                background: `linear-gradient(180deg, ${settings.lockGradientTop} 0%, ${settings.lockGradientBottom} 100%)`,
              }}
            >
              <LockLockup
                settings={settings}
                heading={false}
                className="w-[85.3%]"
                button={
                  <span className="btn-lock font-marker inline-block pointer-events-none">
                    {settings.lockButtonLabel || "JOIN SMS"}
                  </span>
                }
              />
            </div>
          </div>

          <button
            onClick={() => saveSettings()}
            disabled={savingSettings}
            className="mt-6 bg-accent text-white font-medium text-xs tracking-widest uppercase rounded-lg px-6 py-3 hover:opacity-85 transition-opacity disabled:opacity-50"
          >
            {savingSettings ? "Saving…" : savedFlash ? "Saved ✓" : "Save changes"}
          </button>
        </Card>

        {/* Signups */}
        <Card
          title={`Signups (${signups.length})`}
          subtitle="People who left an email or phone number for drop alerts."
        >
          {signups.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              No signups yet. They&apos;ll show up here as soon as someone joins the list.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>
                      <th className="px-2 py-2 font-normal">Email</th>
                      <th className="px-2 py-2 font-normal">Phone</th>
                      <th className="px-2 py-2 font-normal">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signups
                      .slice()
                      .reverse()
                      .slice(0, 25)
                      .map((s) => (
                        <tr key={s.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                          <td className="px-2 py-2">{s.email || "—"}</td>
                          <td className="px-2 py-2">{s.phone || "—"}</td>
                          <td className="px-2 py-2" style={{ color: "var(--muted)" }}>
                            {new Date(s.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <a
                href="/api/admin/signups/export"
                className="inline-block mt-4 border rounded-lg px-4 py-2 text-xs tracking-widest uppercase hover:border-accent transition-colors"
                style={{ borderColor: "var(--line)" }}
              >
                Download CSV
              </a>
            </>
          )}
        </Card>

        {/* Products */}
        <Card title="Pieces" subtitle="Your products — photos, prices, badges, sold-out flags. Reorder with the arrows.">
          <div className="grid gap-3">
            {products.map((p, i) =>
              editingId === p.id ? (
                <div key={p.id} className="border rounded-xl p-4" style={{ borderColor: "var(--accent)" }}>
                  <ProductForm
                    initial={p}
                    submitLabel="Save piece"
                    onError={flashError}
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (draft) => {
                      if (await productAction({ action: "update", id: p.id, product: draft })) setEditingId(null);
                    }}
                  />
                </div>
              ) : (
                <div
                  key={p.id}
                  className="border rounded-xl p-3 flex items-center gap-3"
                  style={{ borderColor: "var(--line)" }}
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[rgba(0,0,0,0.05)]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {p.name} {p.soldOut && <span className="text-red-600 text-xs">· sold out</span>}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {p.price || "No price"} {p.tag && `· ${p.tag}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <button onClick={() => productAction({ action: "move", id: p.id, direction: "up" })} disabled={i === 0} className="px-2 py-1 disabled:opacity-20" title="Move up">↑</button>
                    <button onClick={() => productAction({ action: "move", id: p.id, direction: "down" })} disabled={i === products.length - 1} className="px-2 py-1 disabled:opacity-20" title="Move down">↓</button>
                    <button onClick={() => setEditingId(p.id)} className="border rounded-lg px-3 py-1.5 tracking-widest uppercase hover:border-accent transition-colors" style={{ borderColor: "var(--line)" }}>
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.name}"?`)) productAction({ action: "delete", id: p.id });
                      }}
                      className="px-2 py-1.5 hover:text-red-600 transition-colors"
                      style={{ color: "var(--muted)" }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            )}

            {adding ? (
              <div className="border rounded-xl p-4" style={{ borderColor: "var(--accent)" }}>
                <ProductForm
                  initial={EMPTY_PRODUCT}
                  submitLabel="Add piece"
                  onError={flashError}
                  onCancel={() => setAdding(false)}
                  onSubmit={async (draft) => {
                    if (await productAction({ action: "create", product: draft })) setAdding(false);
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="border border-dashed rounded-xl py-4 text-xs tracking-widest uppercase hover:border-accent transition-colors"
                style={{ borderColor: "var(--line)", color: "var(--muted)" }}
              >
                + Add a piece
              </button>
            )}
          </div>
        </Card>

        {/* Look & feel */}
        <Card title="Look &amp; feel" subtitle="The touches that make it yours — everything here shows up on the site instantly.">
          <div className="grid sm:grid-cols-2 gap-4">
            <label>
              <Label>Brand name</Label>
              <input className="field" value={settings.brandName} onChange={(e) => set({ brandName: e.target.value })} />
            </label>
            <label>
              <Label>Tagline</Label>
              <input className="field" value={settings.tagline} onChange={(e) => set({ tagline: e.target.value })} />
            </label>
            <label className="sm:col-span-2">
              <Label>Announcement bar (leave empty to hide)</Label>
              <input className="field" value={settings.announcement} onChange={(e) => set({ announcement: e.target.value })} />
            </label>
            <label className="sm:col-span-2">
              <Label>Hero headline (line breaks respected)</Label>
              <textarea className="field" rows={2} value={settings.heroHeadline} onChange={(e) => set({ heroHeadline: e.target.value })} />
            </label>
            <div className="sm:col-span-2">
              <Label>Hero background photo</Label>
              <ImagePicker value={settings.heroImage} onChange={(heroImage) => set({ heroImage })} onError={flashError} />
            </div>
            <label className="sm:col-span-2">
              <Label>About text</Label>
              <textarea className="field" rows={3} value={settings.about} onChange={(e) => set({ about: e.target.value })} />
            </label>
            <label>
              <Label>Accent color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => set({ accentColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border cursor-pointer bg-transparent"
                  style={{ borderColor: "var(--line)" }}
                />
                <input className="field" value={settings.accentColor} onChange={(e) => set({ accentColor: e.target.value })} />
              </div>
            </label>
            <label>
              <Label>Product page surface</Label>
              <div className="flex gap-2">
                {(["dark", "light"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => set({ productTheme: mode })}
                    aria-pressed={settings.productTheme === mode}
                    className="flex-1 rounded-lg border px-4 py-2.5 text-xs tracking-widest uppercase transition-colors"
                    style={
                      settings.productTheme === mode
                        ? { borderColor: "var(--ink)", background: "var(--ink)", color: "var(--bg)" }
                        : { borderColor: "var(--line)", color: "var(--muted)" }
                    }
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </label>
            <label>
              <Label>Contact email</Label>
              <input className="field" value={settings.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} placeholder="hello@yourbrand.com" />
            </label>
            <label>
              <Label>Instagram URL</Label>
              <input className="field" value={settings.instagram} onChange={(e) => set({ instagram: e.target.value })} placeholder="https://instagram.com/…" />
            </label>
            <label>
              <Label>TikTok URL</Label>
              <input className="field" value={settings.tiktok} onChange={(e) => set({ tiktok: e.target.value })} placeholder="https://tiktok.com/@…" />
            </label>
          </div>
          <button
            onClick={() => saveSettings()}
            disabled={savingSettings}
            className="mt-6 bg-accent text-white font-medium text-xs tracking-widest uppercase rounded-lg px-6 py-3 hover:opacity-85 transition-opacity disabled:opacity-50"
          >
            {savingSettings ? "Saving…" : savedFlash ? "Saved ✓" : "Save changes"}
          </button>
        </Card>
      </div>
    </div>
  );
}
