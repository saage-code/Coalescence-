import SignupForm from "./SignupForm";

/**
 * The signup band that closes every storefront page, in the lock screen's
 * gradient so the two read as one brand.
 *
 * theme="lock" because this band is the same gradient as the lock screen — the
 * light theme's muted grey is meant for white and goes nearly illegible here.
 */
export default function SignupBand() {
  return (
    <section id="keep-in-touch" className="brand-gradient px-6 sm:px-10 py-16 sm:py-20 text-black">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-script text-3xl sm:text-4xl">Never miss a drop</h2>
        <p className="mt-3 mb-8 text-sm" style={{ color: "rgba(0,0,0,0.7)" }}>
          Drops are announced by SMS first. No spam, only drops.
        </p>
        <SignupForm compact theme="lock" />
      </div>
    </section>
  );
}
