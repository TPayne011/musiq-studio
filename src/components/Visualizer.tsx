"use client";

import { useEffect, useRef } from "react";
import Visualizer from "../../components/Visualizer";

type Props = {
  /** Pass the *ref object* you created: analyserRef */
  analyser: React.RefObject<AnalyserNode | null>;
  /** Optional: bar vs waveform */
  mode?: "wave" | "bars";
};

export default function Visualizer({ analyser, mode = "wave" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const node = analyser.current;
    const canvas = canvasRef.current;
    if (!node || !canvas) return;

    // Make sure FFT/config is sane
    node.fftSize = 2048;
    node.smoothingTimeConstant = 0.85;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const bufferLen = node.frequencyBinCount; // 1024 when fftSize=2048
    const timeData = new Uint8Array(bufferLen);
    const freqData = new Uint8Array(bufferLen);

    // Handle high-DPI so lines don’t look blurry
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    function resize() {
      const cssW = canvas.clientWidth || 600;
      const cssH = canvas.clientHeight || 128;
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    function drawWave() {
      node.getByteTimeDomainData(timeData);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f3f4f6"; // bg (Tailwind gray-100-ish)
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#111827"; // near black
      ctx.beginPath();

      const w = canvas.clientWidth || 600;
      const h = canvas.clientHeight || 128;
      const slice = w / bufferLen;

      for (let i = 0; i < bufferLen; i++) {
        const v = timeData[i] / 128.0; // center ~1.0
        const y = (v * h) / 2;
        const x = i * slice;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.stroke();
    }

    function drawBars() {
      node.getByteFrequencyData(freqData);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.clientWidth || 600;
      const h = canvas.clientHeight || 128;
      const barW = Math.max(1, Math.floor(w / bufferLen));

      for (let i = 0; i < bufferLen; i++) {
        const v = freqData[i] / 255;
        const barH = v * h;
        ctx.fillStyle = "#111827";
        ctx.fillRect(i * barW, h - barH, barW - 1, barH);
      }
    }

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (mode === "bars") drawBars();
      else drawWave();
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [analyser, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded bg-gray-100"
      // width/height are set dynamically; CSS controls layout size
    />
  );
}
