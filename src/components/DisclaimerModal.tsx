"use client";

import { usePathname } from "next/navigation";
import { useProgressContext } from "./ProgressProvider";

/** First-launch safety disclaimer. Dismissal is persisted. Never shown on /admin. */
export function DisclaimerModal() {
  const { hydrated, disclaimerAccepted, acceptDisclaimer } = useProgressContext();
  const pathname = usePathname();
  if (!hydrated || disclaimerAccepted || pathname?.startsWith("/admin")) return null;
  return (
    <div
      className="modal-scrim"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="modal">
        <h2 id="disclaimer-title">Before you begin</h2>
        <p>
          Steady is a gentle, progressive program for strengthening the muscles
          that support your knees.
        </p>
        <p>
          <strong>A quick safety note:</strong> if you&apos;ve had recent knee
          surgery, a serious injury, or your doctor has given you a specific
          rehab plan, follow that plan first. These exercises are general — your
          provider&apos;s guidance always wins.
        </p>
        <p>
          During any exercise: mild effort and gentle stretching are good. Sharp
          pain, swelling, or your knee &quot;giving way&quot; means stop.
        </p>
        <button className="big-btn" onClick={acceptDisclaimer}>
          I understand — let&apos;s go
        </button>
      </div>
    </div>
  );
}
