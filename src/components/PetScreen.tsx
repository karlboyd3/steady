"use client";

import { Pet } from "./Pet";
import { ITEMS, type Equipped, type Item } from "@/lib/rewards";

export function PetScreen({
  petName,
  setPetName,
  coins,
  owned,
  equipped,
  level,
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
  onBuy: (item: Item) => void;
  onEquip: (item: Item) => void;
  onBack: () => void;
}) {
  const ownedSet = new Set(owned);
  return (
    <div>
      <div className="session-top">
        <button className="icon-btn" onClick={onBack}>
          ← Back
        </button>
        <span className="where">Buddy&apos;s Corner</span>
        <span className="coin-chip">🪙 {coins}</span>
      </div>
      <div className="card" style={{ textAlign: "center" }}>
        <Pet equipped={equipped} size={230} name={petName} />
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
      </div>
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
    </div>
  );
}
