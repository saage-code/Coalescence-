import type { SiteSettings } from "@/lib/db";
import LockLockup from "./LockLockup";
import SignupForm from "./SignupForm";

// What customers see when the store is locked: the brand mark on a gradient
// with an SMS/email signup, and nothing else. Colors, logo and copy all come
// from the admin panel. LockLockup holds the artwork's proportions; this file
// just supplies the gradient and the live signup form.
export default function LockScreen({ settings }: { settings: SiteSettings }) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center text-black"
      style={{
        background: `linear-gradient(180deg, ${settings.lockGradientTop} 0%, ${settings.lockGradientBottom} 100%)`,
      }}
    >
      <LockLockup
        settings={settings}
        className="w-[85.3vw] max-w-[56rem]"
        button={<SignupForm theme="lock" revealLabel={settings.lockButtonLabel || "JOIN SMS"} />}
      />

      {settings.lockMessage && (
        <p className="font-marker mt-8 max-w-sm text-base leading-snug" style={{ color: "rgba(0,0,0,0.7)" }}>
          {settings.lockMessage}
        </p>
      )}
    </main>
  );
}
