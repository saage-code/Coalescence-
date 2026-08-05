import type { SiteSettings } from "@/lib/db";

// The sticker lockup: wordmark, headline, then the button.
//
// This is a container-query context and every size inside it is in `cqw`
// (percent of the lockup's own width), which is what keeps the three pieces in
// the printed artwork's exact relationship at any width instead of each one
// scaling on its own curve. The ratios come from measuring the PDF: against a
// 522.3pt-wide wordmark, "BRB!" is set at 50.06pt (9.58%) and the button label
// at 47.41pt (9.08%), with 38pt and 55pt gaps between the rows.
//
// Both the live lock screen and the admin preview render through here so the
// preview can't drift away from what customers actually see.
export default function LockLockup({
  settings,
  button,
  heading = true,
  className = "",
}: {
  settings: Pick<SiteSettings, "brandName" | "lockLogo" | "lockHeadline">;
  /** The JOIN button — interactive on the lock screen, inert in the preview. */
  button: React.ReactNode;
  /** Render the wordmark as the page's h1. Off for the admin preview. */
  heading?: boolean;
  className?: string;
}) {
  const Wordmark = heading ? "h1" : "div";
  return (
    <div
      className={`flex flex-col items-center ${className}`}
      style={
        {
          containerType: "inline-size",
          // Read by .btn-lock so the button tracks the lockup too.
          "--lock-btn-size": "9.08cqw",
        } as React.CSSProperties
      }
    >
      <Wordmark className="w-full">
        {settings.lockLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.lockLogo} alt={settings.brandName} className="w-full object-contain" />
        ) : (
          <span
            className="font-brush block w-full leading-[1.05] break-words"
            style={{ fontSize: "13cqw" }}
          >
            {settings.brandName}
          </span>
        )}
      </Wordmark>

      {settings.lockHeadline && (
        <p className="font-marker" style={{ fontSize: "9.58cqw", lineHeight: 1, marginTop: "8cqw" }}>
          {settings.lockHeadline}
        </p>
      )}

      <div className="w-full flex flex-col items-center" style={{ marginTop: "7.4cqw" }}>
        {button}
      </div>
    </div>
  );
}
