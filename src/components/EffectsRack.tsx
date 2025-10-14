// src/components/EffectsRack.tsx
"use client";
import React from "react";

type FxToggleProps = { label: string };
function FxToggle({ label }: FxToggleProps) {
  return (
    <button
      className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
      type="button"
    >
      {label}
    </button>
  );
}

export default function EffectsRack() {
  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4 backdrop-blur">
      <div className="text-xs uppercase tracking-wider text-neutral-400 mb-2">
        Effects Rack
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {["EQ", "Reverb", "Delay", "Compressor"].map((name) => (
          <FxToggle key={name} label={name} />
        ))}
      </div>
    </div>
  );
}
