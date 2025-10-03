// src/app/components/EffectsRack.tsx
"use client";
import React, { useState } from "react";

export default function EffectsRack() {
  const [reverb, setReverb] = useState(0);
  const [delay, setDelay] = useState(0);
  const [eq, setEq] = useState(0);
  const [compression, setCompression] = useState(0);

  return (
    <div className="border p-4 rounded-md bg-gray-50 space-y-3">
      <h3 className="font-semibold">🎚️ Effects Rack</h3>

      <div>
        <label>Reverb: {reverb}</label>
        <input
          type="range"
          min="0"
          max="100"
          value={reverb}
          onChange={(e) => setReverb(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label>Delay: {delay}</label>
        <input
          type="range"
          min="0"
          max="100"
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label>EQ: {eq}</label>
        <input
          type="range"
          min="0"
          max="100"
          value={eq}
          onChange={(e) => setEq(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label>Compression: {compression}</label>
        <input
          type="range"
          min="0"
          max="100"
          value={compression}
          onChange={(e) => setCompression(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
