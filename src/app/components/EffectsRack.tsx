"use client";

import { useState } from "react";

type Effect = {
  name: string;
  value: number;
  min: number;
  max: number;
};

export default function EffectsRack() {
  const [effects, setEffects] = useState<Effect[]>([
    { name: "Reverb", value: 0, min: 0, max: 100 },
    { name: "Delay", value: 0, min: 0, max: 100 },
    { name: "EQ (Bass)", value: 0, min: -10, max: 10 },
    { name: "Compression", value: 0, min: 0, max: 100 },
  ]);

  const handleChange = (index: number, newValue: number) => {
    const updated = [...effects];
    updated[index].value = newValue;
    setEffects(updated);
  };

  return (
    <div className="bg-gray-100 rounded p-4 shadow-md mt-6">
      <h2 className="font-semibold mb-3">🎛 Effects Rack</h2>
      <div className="space-y-4">
        {effects.map((effect, i) => (
          <div key={effect.name}>
            <label className="block text-sm font-medium">{effect.name}</label>
            <input
              type="range"
              min={effect.min}
              max={effect.max}
              value={effect.value}
              onChange={(e) => handleChange(i, Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-600">{effect.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
