// src/app/components/EffectsRack.tsx
"use client";

import { useState } from "react";

type BypassKeys = "reverb" | "delay" | "bass" | "comp";

type Props = {
  onReverb: (wet0to1: number) => void;
  onDelay: (timeSec: number, feedback0to1: number) => void;
  onBass: (gainDb: number) => void;
  onCompress: (ratio: number) => void;
  bypass?: Partial<Record<BypassKeys, boolean>>;
  onBypassChange?: (key: BypassKeys, v: boolean) => void;
};

export default function EffectsRack({
  onReverb,
  onDelay,
  onBass,
  onCompress,
  bypass = {},
  onBypassChange,
}: Props) {
  // UI state (you can replace these with persisted values later)
  const [reverb, setReverb] = useState(0);      // 0..100 (wet)
  const [delay, setDelay] = useState(0);        // 0..100 (-> 0..0.6s)
  const [fb, setFb] = useState(20);             // 0..90 (%)
  const [bass, setBass] = useState(0);          // -10..+10 dB
  const [ratio, setRatio] = useState(3);        // 1..10

  return (
    <div className="border p-4 rounded-md bg-gray-50 space-y-4 mt-6">
      <h3 className="font-semibold">🎚️ Effects Rack</h3>

      {/* Reverb */}
      <div className="flex items-center justify-between">
        <label className="font-medium">Reverb (wet)</label>
        <label className="text-sm">
          <input
            type="checkbox"
            checked={!!bypass.reverb}
            onChange={(e) => onBypassChange?.("reverb", e.target.checked)}
          />
          <span className="ml-1">Bypass</span>
        </label>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={reverb}
        onChange={(e) => {
          const v = Number(e.target.value);
          setReverb(v);
          onReverb(v / 100);
        }}
        className={`w-full ${bypass.reverb ? "opacity-50 pointer-events-none" : ""}`}
      />
      <div className="text-xs text-gray-600">Wet: {reverb}%</div>

      {/* Delay */}
      <div className="flex items-center justify-between mt-4">
        <label className="font-medium">Delay</label>
        <label className="text-sm">
          <input
            type="checkbox"
            checked={!!bypass.delay}
            onChange={(e) => onBypassChange?.("delay", e.target.checked)}
          />
          <span className="ml-1">Bypass</span>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm">Time: {(delay * 0.006).toFixed(2)}s</label>
          <input
            type="range"
            min={0}
            max={100}
            value={delay}
            onChange={(e) => {
              const v = Number(e.target.value);
              setDelay(v);
              onDelay(v * 0.006, fb / 100);
            }}
            className={`w-full ${bypass.delay ? "opacity-50 pointer-events-none" : ""}`}
          />
        </div>
        <div>
          <label className="block text-sm">Feedback: {fb}%</label>
          <input
            type="range"
            min={0}
            max={90}
            value={fb}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFb(v);
              onDelay(delay * 0.006, v / 100);
            }}
            className={`w-full ${bypass.delay ? "opacity-50 pointer-events-none" : ""}`}
          />
        </div>
      </div>

      {/* Bass (low-shelf EQ) */}
      <div className="flex items-center justify-between mt-4">
        <label className="font-medium">Bass (low-shelf)</label>
        <label className="text-sm">
          <input
            type="checkbox"
            checked={!!bypass.bass}
            onChange={(e) => onBypassChange?.("bass", e.target.checked)}
          />
          <span className="ml-1">Bypass</span>
        </label>
      </div>
      <input
        type="range"
        min={-10}
        max={10}
        value={bass}
        onChange={(e) => {
          const v = Number(e.target.value);
          setBass(v);
          onBass(v);
        }}
        className={`w-full ${bypass.bass ? "opacity-50 pointer-events-none" : ""}`}
      />
      <div className="text-xs text-gray-600">{bass} dB</div>

      {/* Compression */}
      <div className="flex items-center justify-between mt-4">
        <label className="font-medium">Compression ratio</label>
        <label className="text-sm">
          <input
            type="checkbox"
            checked={!!bypass.comp}
            onChange={(e) => onBypassChange?.("comp", e.target.checked)}
          />
          <span className="ml-1">Bypass</span>
        </label>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={0.1}
        value={ratio}
        onChange={(e) => {
          const v = Number(e.target.value);
          setRatio(v);
          onCompress(v);
        }}
        className={`w-full ${bypass.comp ? "opacity-50 pointer-events-none" : ""}`}
      />
      <div className="text-xs text-gray-600">{ratio.toFixed(1)}:1</div>
    </div>
  );
}
