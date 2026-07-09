import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Use — Steady",
  description:
    "Terms of use for Steady, including the general-fitness (not medical advice) position and safety guidance.",
};

const UPDATED = "July 9, 2026";

export default function TermsPage() {
  return (
    <div className="legal">
      <Link href="/" className="back-link">
        ← Back to {APP_NAME}
      </Link>
      <h1>Terms of Use</h1>
      <p className="updated">Last updated {UPDATED}</p>

      <p>
        By using {APP_NAME}, you agree to these terms. Please read them,
        especially the health and safety section.
      </p>

      <h2>General fitness, not medical advice</h2>
      <p>
        {APP_NAME} offers general strengthening and mobility exercises for
        educational and fitness purposes. It is <strong>not</strong> medical
        advice, diagnosis, treatment, or a substitute for care from a qualified
        professional. If you are recovering from surgery or an injury, or a
        doctor or physical therapist has given you a specific plan, follow that
        plan first — their guidance always takes priority over anything in this
        app.
      </p>

      <h2>Exercise safely — stop for sharp pain</h2>
      <p>
        Mild effort and gentle stretching are expected. However,{" "}
        <strong>
          sharp or stabbing pain, swelling, or a knee that &quot;gives
          way&quot; means stop immediately
        </strong>{" "}
        and check in with a healthcare professional before continuing. Only work
        within a range that feels safe and stable for you. You are responsible
        for exercising within your own limits.
      </p>

      <h2>Consult a professional first</h2>
      <p>
        Talk to your doctor before starting any new exercise program, especially
        if you have a medical condition, are pregnant, are recovering from
        injury or surgery, or have any concerns about your ability to exercise
        safely.
      </p>

      <h2>No warranty; limitation of liability</h2>
      <p>
        {APP_NAME} is provided &quot;as is,&quot; without warranties of any kind.
        To the fullest extent permitted by law, we are not liable for any injury,
        loss, or damage arising from your use of the app or the exercises it
        describes. You use {APP_NAME} at your own risk.
      </p>

      <h2>Your data</h2>
      <p>
        This version stores all information locally on your device. See our{" "}
        <Link href="/privacy">Privacy Policy</Link> for details.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </div>
  );
}
