import type { SiteSettings } from "@/lib/db";
import SignupForm from "./SignupForm";

// What customers see when the store is locked: the brand mark on a gradient
// with an SMS/email signup, and nothing else. Colors, logo and copy all come
// from the admin panel.
export default function LockScreen({ settings }: { settings: SiteSettings }) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center text-black"
      style={{
        background: `linear-gradient(180deg, ${settings.lockGradientTop} 0%, ${settings.lockGradientBottom} 100%)`,
      }}
    >
      {settings.lockLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.lockLogo}
          alt={settings.brandName}
          className="w-full max-w-2xl object-contain"
        />
      ) : (
        <h1
          className="font-brush leading-[1.05] break-words max-w-[92vw]"
          style={{ fontSize: "clamp(3rem, 13vw, 9rem)" }}
        >
          {settings.brandName}
        </h1>
      )}

      {settings.lockHeadline && (
        <p
          className="font-marker mt-2 sm:mt-4"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3.25rem)" }}
        >
          {settings.lockHeadline}
        </p>
      )}

      <div className="mt-10 sm:mt-12 w-full flex flex-col items-center">
        <SignupForm theme="lock" revealLabel={settings.lockButtonLabel || "JOIN SMS"} />
      </div>

      {settings.lockMessage && (
        <p className="font-marker mt-8 max-w-sm text-base leading-snug" style={{ color: "rgba(0,0,0,0.7)" }}>
          {settings.lockMessage}
        </p>
      )}
    </main>
  );
}
