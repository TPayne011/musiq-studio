// src/app/studio/pro/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import EffectsRack from "../../components/EffectsRack";
import { useLocalStorage } from "@/lib/useLocalStorage";

export default function ProStudioPage() {
  // -------- Persisted UI state --------
  const [masterVol, setMasterVol] = useLocalStorage<number>(
    "musiqProMasterV1",
    100
  ); // 0..100
  const [fxState, setFxState] = useLocalStorage("musiqProFxV1", {
    reverbWet: 0, // 0..1
    delayTime: 0.25, // seconds
    delayFb: 0.2, // 0..1
    bassDb: 0, // -10..+10
    compRatio: 3, // 1..10
  });
  const [bypass, setBypass] = useLocalStorage("musiqProBypassV1", {
    reverb: false,
    delay: false,
    bass: false,
    comp: false,
  });

  // -------- Audio core --------
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // -------- Tracks (two tracks) --------
  const [track1Url, setTrack1Url] = useState<string | null>("/audio/Rev.mp3"); // default sample
  const [track2Url, setTrack2Url] = useState<string | null>(null);

  const track1SourceRef = useRef<AudioBufferSourceNode | null>(null);
  const track2SourceRef = useRef<AudioBufferSourceNode | null>(null);
  const track1GainRef = useRef<GainNode | null>(null);
  const track2GainRef = useRef<GainNode | null>(null);
  const track1PanRef = useRef<StereoPannerNode | null>(null);
  const track2PanRef = useRef<StereoPannerNode | null>(null);

  // -------- FX nodes --------
  const convolverRef = useRef<ConvolverNode | null>(null); // reverb
  const wetGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const feedbackRef = useRef<GainNode | null>(null);
  const lowShelfRef = useRef<BiquadFilterNode | null>(null); // bass EQ
  const compRef = useRef<DynamicsCompressorNode | null>(null); // compressor
  const limiterRef = useRef<DynamicsCompressorNode | null>(null); // soft limiter

  const [isReady, setIsReady] = useState(false);

  // -------- Helpers --------
  async function loadBuffer(url: string): Promise<AudioBuffer> {
    const ctx = audioCtxRef.current!;
    const resp = await fetch(url);
    const arr = await resp.arrayBuffer();
    return await ctx.decodeAudioData(arr);
  }

  function stopTrack(track: 1 | 2) {
    const srcRef = track === 1 ? track1SourceRef : track2SourceRef;
    try {
      srcRef.current?.stop();
    } catch {}
    srcRef.current = null;
  }

  async function playTrack(track: 1 | 2) {
    const ctx = audioCtxRef.current!;
    const url = track === 1 ? track1Url : track2Url;
    if (!url) return;

    // stop if playing
    stopTrack(track);

    const buffer = await loadBuffer(url);
    const src = ctx.createBufferSource();
    src.buffer = buffer;

    // route: src -> gain -> pan -> masterGain
    const gain = track === 1 ? track1GainRef.current! : track2GainRef.current!;
    const pan = track === 1 ? track1PanRef.current! : track2PanRef.current!;
    src.connect(gain);
    gain.connect(pan);
    pan.connect(masterGainRef.current!);

    src.start();
    if (track === 1) track1SourceRef.current = src;
    else track2SourceRef.current = src;
  }

  // -------- Audio graph init (run once) --------
  useEffect(() => {
    if (audioCtxRef.current) return;

    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    // core
    masterGainRef.current = ctx.createGain();
    masterGainRef.current.gain.value = (masterVol ?? 100) / 100;

    analyserRef.current = ctx.createAnalyser();
    analyserRef.current.fftSize = 2048;

    // tracks
    track1GainRef.current = ctx.createGain();
    track2GainRef.current = ctx.createGain();
    track1PanRef.current = ctx.createStereoPanner();
    track2PanRef.current = ctx.createStereoPanner();

    // FX
    // reverb (tiny impulse)
    convolverRef.current = ctx.createConvolver();
    const len = 2048;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++)
        data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    convolverRef.current.buffer = impulse;

    wetGainRef.current = ctx.createGain();
    dryGainRef.current = ctx.createGain();
    wetGainRef.current.gain.value = fxState.reverbWet ?? 0;
    dryGainRef.current.gain.value = 1 - (fxState.reverbWet ?? 0);

    delayRef.current = ctx.createDelay(1.0);
    feedbackRef.current = ctx.createGain();
    feedbackRef.current.gain.value = fxState.delayFb ?? 0.2;
    delayRef.current.delayTime.value = fxState.delayTime ?? 0.25;
    delayRef.current.connect(feedbackRef.current);
    feedbackRef.current.connect(delayRef.current); // feedback loop

    lowShelfRef.current = ctx.createBiquadFilter();
    lowShelfRef.current.type = "lowshelf";
    lowShelfRef.current.frequency.value = 200;
    lowShelfRef.current.gain.value = fxState.bassDb ?? 0;

    compRef.current = ctx.createDynamicsCompressor();
    compRef.current.threshold.value = -24;
    compRef.current.knee.value = 30;
    compRef.current.ratio.value = fxState.compRatio ?? 3;
    compRef.current.attack.value = 0.003;
    compRef.current.release.value = 0.25;

    limiterRef.current = ctx.createDynamicsCompressor();
    limiterRef.current.threshold.value = -2;
    limiterRef.current.knee.value = 0;
    limiterRef.current.ratio.value = 20;
    limiterRef.current.attack.value = 0.003;
    limiterRef.current.release.value = 0.05;

    // ROUTING
    // tracks -> master
    track1GainRef.current
      .connect(track1PanRef.current)
      .connect(masterGainRef.current);
    track2GainRef.current
      .connect(track2PanRef.current)
      .connect(masterGainRef.current);

    // master -> low shelf
    masterGainRef.current.connect(lowShelfRef.current);

    // lowshelf -> dry & reverb sends
    lowShelfRef.current.connect(dryGainRef.current);
    lowShelfRef.current.connect(wetGainRef.current);

    // reverb path
    wetGainRef.current.connect(convolverRef.current);
    convolverRef.current.connect(compRef.current);

    // delay (parallel)
    lowShelfRef.current.connect(delayRef.current);
    delayRef.current.connect(compRef.current);

    // dry path into comp
    dryGainRef.current.connect(compRef.current);

    // comp -> limiter -> analyser -> out
    compRef.current.connect(limiterRef.current);
    limiterRef.current.connect(analyserRef.current);
    analyserRef.current.connect(ctx.destination);

    // honor bypass at startup
    if (bypass.reverb) {
      wetGainRef.current.gain.value = 0;
      dryGainRef.current.gain.value = 1;
    }
    if (bypass.delay) {
      delayRef.current.delayTime.value = 0;
      feedbackRef.current.gain.value = 0;
    }
    if (bypass.bass) {
      lowShelfRef.current.gain.value = 0;
    }
    if (bypass.comp) {
      compRef.current.ratio.value = 1;
    }

    setIsReady(true);

    return () => {
      ctx.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- UI --------
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Studio Pro</h1>
      <p className="text-sm text-gray-600">
        Two-track player with reverb, delay, bass EQ, compression, soft limiter,
        and persistence.
      </p>

      {/* Master volume */}
      <div className="border rounded-md p-4">
        <label className="block font-medium">Master Volume</label>
        <input
          type="range"
          min={0}
          max={100}
          value={masterVol}
          onChange={(e) => {
            const v = Number(e.target.value);
            setMasterVol(v);
            if (masterGainRef.current)
              masterGainRef.current.gain.value = v / 100;
          }}
          className="w-full"
        />
        <div className="text-xs text-gray-600">{masterVol}%</div>
      </div>

      {/* Track 1 */}
      <div className="border rounded-md p-4">
        <h3 className="font-semibold">Track 1</h3>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            className="border px-2 py-1 rounded w-full"
            value={track1Url ?? ""}
            placeholder="/audio/Rev.mp3 or https://..."
            onChange={(e) => setTrack1Url(e.target.value || null)}
          />
          <button
            className="px-3 py-1 rounded bg-gray-900 text-white"
            onClick={() => playTrack(1)}
            disabled={!isReady || !track1Url}
          >
            Play
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => stopTrack(1)}
            disabled={!isReady}
          >
            Stop
          </button>
        </div>
      </div>

      {/* Track 2 */}
      <div className="border rounded-md p-4">
        <h3 className="font-semibold">Track 2</h3>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            className="border px-2 py-1 rounded w-full"
            value={track2Url ?? ""}
            placeholder="Paste a URL or /audio/... path"
            onChange={(e) => setTrack2Url(e.target.value || null)}
          />
          <button
            className="px-3 py-1 rounded bg-gray-900 text-white"
            onClick={() => playTrack(2)}
            disabled={!isReady || !track2Url}
          >
            Play
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => stopTrack(2)}
            disabled={!isReady}
          >
            Stop
          </button>
        </div>
      </div>

      {/* Effects Rack */}
      <EffectsRack
        onReverb={(wet) => {
          if (!wetGainRef.current || !dryGainRef.current) return;
          wetGainRef.current.gain.value = wet;
          dryGainRef.current.gain.value = 1 - wet;
          setFxState((s: any) => ({ ...s, reverbWet: wet }));
        }}
        onDelay={(timeSec, fb) => {
          if (!delayRef.current || !feedbackRef.current) return;
          delayRef.current.delayTime.value = Math.min(
            0.6,
            Math.max(0, timeSec)
          );
          feedbackRef.current.gain.value = Math.min(0.9, Math.max(0, fb));
          setFxState((s: any) => ({ ...s, delayTime: timeSec, delayFb: fb }));
        }}
        onBass={(gainDb) => {
          if (!lowShelfRef.current) return;
          lowShelfRef.current.gain.value = gainDb;
          setFxState((s: any) => ({ ...s, bassDb: gainDb }));
        }}
        onCompress={(ratio) => {
          if (!compRef.current) return;
          compRef.current.ratio.value = ratio;
          setFxState((s: any) => ({ ...s, compRatio: ratio }));
        }}
        bypass={bypass}
        onBypassChange={(key, v) => {
          setBypass((b: any) => ({ ...b, [key]: v }));
          if (
            key === "reverb" &&
            wetGainRef.current &&
            dryGainRef.current &&
            v
          ) {
            wetGainRef.current.gain.value = 0;
            dryGainRef.current.gain.value = 1;
          }
          if (key === "delay" && delayRef.current && feedbackRef.current && v) {
            delayRef.current.delayTime.value = 0;
            feedbackRef.current.gain.value = 0;
          }
          if (key === "bass" && lowShelfRef.current && v) {
            lowShelfRef.current.gain.value = 0;
          }
          if (key === "comp" && compRef.current && v) {
            compRef.current.ratio.value = 1; // 1:1 ≈ off
          }
        }}
      />
    </main>
  );
}
