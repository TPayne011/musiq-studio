"use client";
import { useState } from "react";

export default function EffectsRack({
  onReverb,
  onDelay,
  onBass,
  onCompress,
}: {
  onReverb: (wet0to1: number) => void;
  onDelay: (timeSec: number, feedback0to9: number) => void;
  onBass: (gainDb: number) => void;
  onCompress: (ratio: number) => void;
}) {
  const [reverb, setReverb] = useState(0); // 0..100 (wet)
  const [delay, setDelay] = useState(0); // 0..100 (maps to 0..0.6s)
  const [fb, setFb] = useState(20); // 0..90 (feedback %)
  const [bass, setBass] = useState(0); // -10..+10 dB
  const [ratio, setRatio] = useState(3); // 1..10

  return (
    <div className="border p-4 rounded-md bg-gray-50 space-y-4 mt-6">
      <h3 className="font-semibold">🎚️ Effects Rack</h3>

      <div>
        <label>Reverb (wet): {reverb}%</label>
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
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Delay time: {(delay * 0.006).toFixed(2)}s</label>
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
            className="w-full"
          />
        </div>
        <div>
          <label>Delay feedback: {fb}%</label>
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
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label>Bass (EQ lowshelf): {bass} dB</label>
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
          className="w-full"
        />
      </div>

      <div>
        <label>Compression ratio: {ratio.toFixed(1)}:1</label>
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
          className="w-full"
        />
      </div>
    </div>
  );
}
