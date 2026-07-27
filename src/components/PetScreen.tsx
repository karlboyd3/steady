"use client";

import { useState } from "react";
import { ProgressCompanion } from "./ProgressCompanion";
import { BottomSheet } from "./BottomSheet";
import { ITEMS, SPECIES, type Equipped, type Item, type Species } from "@/lib/rewards";
import { useTenant } from "@/lib/tenant/tenant-provider";

function SpeciesGrid({
  current,
  onPick,
}: {
  current?: Species;
  onPick: (species: Species) => void;
}) {
  return (
    <div className="closet-grid">
      {SPECIES.map((s) => (
        <button
          key={s.id}
          className={`closet-item ${s.id === current ? "equipped" : ""}`}
          onClick={() => onPick(s.id)}
        >
          <div className="ci-emoji">{s.emoji}</div>
          <div className="ci-name">{s.label}</div>
        </button>
      ))}
    </div>
  );
}

export function PetScreen({
  petName,
  setPetName,
  coins,
  owned,
  equipped,
  level,
  species,
  speciesChosen,
  setSpecies,
  onBuy,
  onEquip,
  onBack,
}: {
  petName: string;
  setPetName: (name: string) => void;
  coins: number;
  owned: string[];
  equipped: Equipped;
  level: number;
  species: Species;
  speciesChosen: boolean;
  setSpecies: (species: Species) => void;
  onBuy: (item: Item) => void;
  onEquip: (item: Item) => void;
  onBack: () => void;
}) {
  const tenant = useTenant();
  const [pickerOpen, setPickerOpen] = useState(false);
  const ownedSet = new Set(owned);
  const showSpeciesStep = tenant.mascotEnabled && !speciesChosen;

  return (
    <div>
      <div className="session-top">
        <button className="icon-btn" onClick={onBack}>
          ← Back
        </button>
        <span className="where">Buddy&apos;s Corner</span>
        <span className="coin-chip">🪙 {coins}</span>
      </div>

      {showSpeciesStep ? (
        <div className="card">
          <div className="section-label" style={{ margin: "0 0 10px" }}>
            Choose your buddy
          </div>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", marginBottom: 12 }}>
            Pick a companion to keep you company through the program. You can change this
            later.
          </p>
          <SpeciesGrid onPick={setSpecies} />
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center" }}>
          <ProgressCompanion equipped={equipped} size={230} name={petName} variant="hero" />
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <input
              className="pet-name"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              aria-label="Pet name"
            />
            <span className="level-pill">Lv {level}</span>
          </div>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", marginTop: 8 }}>
            {petName || "Your buddy"} levels up every 5 sessions you finish.
          </p>
          {tenant.mascotEnabled && (
            <button
              className="ci-btn"
              style={{ marginTop: 10, width: "auto", padding: "8px 16px" }}
              onClick={() => setPickerOpen(true)}
            >
              Change species
            </button>
          )}
        </div>
      )}

      <div className="section-label">Closet — earn 🪙 by finishing sessions</div>
      <div className="closet-grid">
        {ITEMS.map((it) => {
          const has = ownedSet.has(it.id);
          const on = equipped[it.slot] === it.id;
          return (
            <div key={it.id} className={`closet-item ${on ? "equipped" : ""}`}>
              <div className="ci-emoji">{it.emoji}</div>
              <div className="ci-name">{it.name}</div>
              {has ? (
                <button className="ci-btn" onClick={() => onEquip(it)}>
                  {on ? "Take off" : "Wear it"}
                </button>
              ) : (
                <button
                  className="ci-btn buy"
                  disabled={coins < it.cost}
                  onClick={() => onBuy(it)}
                >
                  🪙 {it.cost}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} ariaLabel="Choose your buddy">
        <div className="section-label" style={{ margin: "0 0 10px" }}>
          Choose your buddy
        </div>
        <SpeciesGrid
          current={species}
          onPick={(s) => {
            setSpecies(s);
            setPickerOpen(false);
          }}
        />
      </BottomSheet>
    </div>
  );
}
