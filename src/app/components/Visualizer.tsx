"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  /** Ref to the shared AnalyserNode created in the page */
  analyser: React.RefObject<AnalyserNode>;
  /** "bars" for spectrum, "wave" for waveform */
  mode?: "bars" | "wave";
};

export default function Visualizer({ analyser, mode = "bars" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const an = analyser.current;
    const canvas = canvasRef.current;
    if (!an || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configure analyser (these are safe to set each mount)
    if (mode === "bars") {
      an.fftSize = 1024; // smaller for chunkier bars
    } else {
      an.fftSize = 2048; // larger for smoother waveform
    }

    const bufferLen = mode === "bars" ? an.frequencyBinCount : an.fftSize; // waveform uses time domain length
    const data =
      mode === "bars" ? new Uint8Array(bufferLen) : new Uint8Array(bufferLen);

    let rafId = 0;

    const draw = () => {
      rafId = requestAnimationFrame(draw);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      if (mode === "bars") {
        an.getByteFrequencyData(data); // 0..255
        const barWidth = Math.max(1, Math.floor(width / bufferLen));
        for (let i = 0; i < bufferLen; i++) {
          const v = data[i]; // 0..255
          const barHeight = (v / 255) * height;
          // simple gradient-ish coloring
          ctx.fillStyle = `hsl(${(i / bufferLen) * 200 + 160}, 70%, 55%)`;
          ctx.fillRect(
            i * barWidth,
            height - barHeight,
            barWidth - 1,
            barHeight
          );
        }
      } else {
        // waveform
        an.getByteTimeDomainData(data); // 0..255 centered around 128
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const slice = width / bufferLen;
        for (let i = 0; i < bufferLen; i++) {
          const v = (data[i] - 128) / 128; // -1..1
          const x = i * slice;
          const y = height / 2 + v * (height / 2) * 0.9;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [analyser, mode]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={128}
      className="w-full h-32 rounded bg-gray-100"
    />
  );
}
