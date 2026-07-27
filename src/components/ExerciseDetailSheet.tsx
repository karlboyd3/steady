"use client";

/* ============================================================
   ExerciseDetailSheet — Screen 2. Opened from a row on the
   Workout Overview or the (?) icon in the Active Player, as a
   shared overlay so it never causes a navigation.
   ============================================================ */

import { useEffect, useState } from "react";
import type { DayItem, RepOverrides } from "@/lib/exercises";
import { BottomSheet } from "./BottomSheet";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl";
import { Stepper } from "./Stepper";
import { Toast } from "./Toast";
import { BodyMap } from "./BodyMap";
import { LiteYouTube } from "./LiteYouTube";
import { ExerciseAnimation } from "./ExerciseAnimation";

type Tab = "animation" | "muscle" | "howto";

export function ExerciseDetailSheet({
  open,
  onClose,
  items,
  index,
  onNavigate,
  overrides,
  onOverrideChange,
}: {
  open: boolean;
  onClose: () => void;
  items: DayItem[];
  index: number;
  onNavigate: (index: number) => void;
  overrides: RepOverrides;
  onOverrideChange: (
    id: DayItem["id"],
    patch: { reps?: number; secs?: number }
  ) => void;
}) {
  const [tab, setTab] = useState<Tab>("animation");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const item = items[index];
  const ex = item?.ex;

  useEffect(() => {
    if (tab === "howto" && !ex?.videoUrl) setTab("animation");
  }, [tab, ex?.videoUrl]);

  if (!open || !item || !ex) return null;

  const override = overrides[item.id];
  const value =
    ex.type === "reps" ? override?.reps ?? item.reps ?? 0 : override?.secs ?? item.secs ?? 0;

  const tabs: SegmentedOption<Tab>[] = [
    { value: "animation", label: "Animation" },
    { value: "muscle", label: "Muscle" },
    ...(ex.videoUrl ? [{ value: "howto" as Tab, label: "How to do" }] : []),
  ];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel={`${ex.name} details`}
      footer={
        <>
          <div className="detail-footer-row">
            <button
              type="button"
              className="icon-btn"
              onClick={() => onNavigate(index - 1)}
              disabled={index === 0}
            >
              ← Prev
            </button>
            <span className="detail-counter">
              {index + 1}/{items.length}
            </span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => onNavigate(index + 1)}
              disabled={index === items.length - 1}
            >
              Next →
            </button>
          </div>
          <button type="button" className="big-btn" onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <div className="detail-header">
        <h2 className="display detail-name">{ex.name}</h2>
        <button
          type="button"
          className="icon-btn detail-replace"
          onClick={() => setToastMsg("Swapping exercises is coming soon")}
        >
          Replace
        </button>
      </div>

      <SegmentedControl options={tabs} value={tab} onChange={setTab} />

      <div className="detail-tab-panel">
        {tab === "animation" && (
          <div className="detail-anim">
            <ExerciseAnimation exerciseId={item.id} />
          </div>
        )}
        {tab === "muscle" && <BodyMap highlighted={ex.focusAreas} />}
        {tab === "howto" && ex.videoUrl && (
          <LiteYouTube url={ex.videoUrl} title={ex.name} />
        )}
      </div>

      <div className="detail-row">
        <div className="detail-row-label">
          Repeats{ex.perLeg ? " · each side" : ""}
        </div>
        <Stepper
          value={value}
          min={ex.type === "time" ? 5 : 1}
          step={ex.type === "time" ? 5 : 1}
          label="repeats"
          onChange={(v) =>
            onOverrideChange(
              item.id,
              ex.type === "reps" ? { reps: v } : { secs: v }
            )
          }
        />
      </div>

      <section>
        <div className="section-label" style={{ marginTop: 18 }}>
          Instructions
        </div>
        <ol className="detail-list">
          {ex.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      <section>
        <div className="section-label">Common Mistakes</div>
        <ol className="mistake-list">
          {ex.commonMistakes.map((m, i) => (
            <li key={i}>
              <strong>{m.title}.</strong> {m.detail}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="section-label">Breathing Tips</div>
        <ul className="detail-list">
          {ex.breathingTips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>

      <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} />
    </BottomSheet>
  );
}
