// src/components/EffectsRack.tsx
"use client";

import React from "react";

type EffectsRackProps = {
  /** AudioContext ref from Pro page */
  ctxRef: React.MutableRefObject<AudioContext | null>;
  /** Master gain node ref */
  inputRef: React.MutableRefObject<GainNode | null>;
  /** Analyser node ref */
  outputRef: React.MutableRefObject<AnalyserNode | null>;
  className?: string;
};

export default function EffectsRack({
  ctxRef,
  inputRef,
  outputRef,
  className,
}: EffectsRackProps) {
  // toggles
  const [eqOn, setEqOn] = React.useState(false);
  const [revOn, setRevOn] = React.useState(false);
  const [delOn, setDelOn] = React.useState(false);
  const [compOn, setCompOn] = React.useState(false);

  // nodes
  const lowShelfRef = React.useRef<BiquadFilterNode | null>(null);
  const highShelfRef = React.useRef<BiquadFilterNode | null>(null);
  const convolverRef = React.useRef<ConvolverNode | null>(null);
  const delayRef = React.useRef<DelayNode | null>(null);
  const compressorRef = React.useRef<DynamicsCompressorNode | null>(null);

  function safeDisconnect(n?: AudioNode | null) {
    try {
      n?.disconnect();
    } catch {}
  }

  async function ensureReverbIR(ctx: AudioContext, node: ConvolverNode) {
    if (node.buffer) return;
    const len = Math.floor(ctx.sampleRate * 1.0); // ~1s tail
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); // exp-decay noise
      }
    }
    node.buffer = buf;
  }

  function ensureNodes() {
    const ctx = ctxRef.current;
    if (!ctx) return;

    if (!lowShelfRef.current) {
      const n = ctx.createBiquadFilter();
      n.type = "lowshelf";
      n.frequency.value = 200;
      n.gain.value = 5;
      lowShelfRef.current = n;
    }
    if (!highShelfRef.current) {
      const n = ctx.createBiquadFilter();
      n.type = "highshelf";
      n.frequency.value = 4000;
      n.gain.value = 4;
      highShelfRef.current = n;
    }
    if (!convolverRef.current) {
      convolverRef.current = ctx.createConvolver();
    }
    if (!delayRef.current) {
      const n = ctx.createDelay(1.0);
      n.delayTime.value = 0.18;
      delayRef.current = n;
    }
    if (!compressorRef.current) {
      const n = ctx.createDynamicsCompressor();
      n.threshold.value = -18;
      n.knee.value = 24;
      n.ratio.value = 3;
      n.attack.value = 0.003;
      n.release.value = 0.25;
      compressorRef.current = n;
    }
  }

  async function rebuildChain() {
    const ctx = ctxRef.current;
    const input = inputRef.current as unknown as AudioNode;
    const output = outputRef.current as unknown as AudioNode;
    if (!ctx || !input || !output) return;

    ensureNodes();

    const lowShelf = lowShelfRef.current!;
    const highShelf = highShelfRef.current!;
    const convolver = convolverRef.current!;
    const delay = delayRef.current!;
    const comp = compressorRef.current!;

    if (revOn) await ensureReverbIR(ctx, convolver);

    safeDisconnect(input);
    [lowShelf, highShelf, convolver, delay, comp].forEach(safeDisconnect);

    const chain: AudioNode[] = [input];
    if (eqOn) chain.push(lowShelf, highShelf);
    if (revOn) chain.push(convolver);
    if (delOn) chain.push(delay);
    if (compOn) chain.push(comp);
    chain.push(output);

    for (let i = 0; i < chain.length - 1; i++) {
      try {
        chain[i].connect(chain[i + 1] as AudioNode);
      } catch {}
    }
  }

  React.useEffect(() => {
    rebuildChain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eqOn, revOn, delOn, compOn]);

  React.useEffect(() => {
    return () => {
      const input = inputRef.current as unknown as AudioNode;
      const output = outputRef.current as unknown as AudioNode;
      if (!input || !output) return;
      safeDisconnect(input);
      try {
        input.connect(output);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`rounded-xl border border-neutral-700 bg-neutral-900/60 p-4 backdrop-blur ${
        className ?? ""
      }`}
    >
      <div className="mb-2 text-xs uppercase tracking-wider text-neutral-400">
        Effects Rack
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <FxToggle
          label="EQ"
          active={eqOn}
          onToggle={() => setEqOn((v) => !v)}
        />
        <FxToggle
          label="Reverb"
          active={revOn}
          onToggle={() => setRevOn((v) => !v)}
        />
        <FxToggle
          label="Delay"
          active={delOn}
          onToggle={() => setDelOn((v) => !v)}
        />
        <FxToggle
          label="Compressor"
          active={compOn}
          onToggle={() => setCompOn((v) => !v)}
        />
      </div>
    </div>
  );
}

function FxToggle({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-lg border px-3 py-2 text-sm transition
        ${
          active
            ? "border-pink-500/60 bg-pink-500/15 text-pink-200"
            : "border-neutral-700 text-neutral-100 hover:bg-neutral-800"
        }`}
    >
      {label}
    </button>
  );
}
