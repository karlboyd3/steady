import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy — Steady",
  description:
    "How Steady handles your data: everything is stored locally on your device. No accounts, no servers, no tracking.",
};

const UPDATED = "July 9, 2026";

export default function PrivacyPage() {
  return (
    <div className="legal">
      <Link href="/" className="back-link">
        ← Back to {APP_NAME}
      </Link>
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated {UPDATED}</p>

      <p>
        {APP_NAME} is designed to respect your privacy completely. This version
        of the app does not collect, transmit, or share any personal
        information.
      </p>

      <h2>What we store, and where</h2>
      <p>
        All of your information stays <strong>on your own device</strong>, in
        your browser&apos;s local storage. Nothing is sent to us or to any third
        party. Specifically, {APP_NAME} saves:
      </p>
      <ul>
        <li>Your chosen level and which of the 30 days you&apos;ve completed</li>
        <li>Your streak, coins, and buddy customization</li>
        <li>Your settings (such as sound on/off)</li>
      </ul>
      <p>
        There is no account and no sign-in. Because this data lives only on your
        device, clearing your browser data or uninstalling the app will
        permanently remove it, and it does not sync between devices.
      </p>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not collect names, emails, or contact information.</li>
        <li>We do not use analytics, advertising, or tracking technologies.</li>
        <li>We do not use third-party data-collection SDKs.</li>
        <li>We do not sell or share data, because we don&apos;t have any.</li>
      </ul>

      <h2>Permissions</h2>
      <p>
        {APP_NAME} may request permission to keep your screen awake during a
        session so your phone doesn&apos;t sleep mid-exercise. It does not use
        your camera, microphone, or location.
      </p>

      <h2>Children</h2>
      <p>
        {APP_NAME} is a general-audience fitness app and is not directed at
        children under 13. It collects no data from anyone.
      </p>

      <h2>Changes</h2>
      <p>
        If a future version adds features that handle data differently (for
        example, optional cloud backup), we will update this policy and make the
        change clear before it takes effect.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about your privacy? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </div>
  );
}
