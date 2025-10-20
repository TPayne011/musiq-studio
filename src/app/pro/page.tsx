// src/app/pro/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Visualizer from "@/components/Visualizer";
import EffectsRack from "@/components/EffectsRack";
import { useLocalStorage } from "@/lib/useLocalStorage";

function fmt(sec?: number | null) {
  if (sec == null || !isFinite(sec)) return "0:00";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function ProPage() {
  const router = useRouter();

  // ----- Audio graph (master + analyser) -----
  const audioRef1 = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mGainRef = useRef<GainNode | null>(null);

  const src1Ref = useRef<MediaElementAudioSourceNode | null>(null);
  const src2Ref = useRef<MediaElementAudioSourceNode | null>(null);
  const didInitRef = useRef(false);

  const [ctxUnlocked, setCtxUnlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // track URLs
  const [track1Url, setTrack1Url] = useLocalStorage<string | null>(
    "proTrack1Url",
    "/audio/sample-beat.mp3"
  );
  const [track2Url, setTrack2Url] = useState<string | null>(null);

  // times
  const [t1Time, setT1Time] = useState(0);
  const [t2Time, setT2Time] = useState(0);
  const [t1Dur, setT1Dur] = useState<number | null>(null);
  const [t2Dur, setT2Dur] = useState<number | null>(null);

  // master
  const [masterVol, setMasterVol] = useState(80);

  // titles + save states
  const [title1, setTitle1] = useState("Deck A");
  const [title2, setTitle2] = useState("Deck B");
  const [saving1, setSaving1] = useState(false);
  const [saving2, setSaving2] = useState(false);
  const [prog1, setProg1] = useState(0);
  const [prog2, setProg2] = useState(0);
  const [msg1, setMsg1] = useState("");
  const [msg2, setMsg2] = useState("");

  function ensureCtx() {
    const AC =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AC();
    }
  }

  async function unlockCtx() {
    ensureCtx();
    if (!ctxRef.current) return;
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    setCtxUnlocked(true);
  }

  function ensureLink() {
    const ctx = ctxRef.current;
    const mg = mGainRef.current;
    const an = analyserRef.current;
    if (!ctx || !mg || !an) return;
    try {
      mg.disconnect();
      an.disconnect();
      mg.connect(an);
      an.connect(ctx.destination);
    } catch {}
  }

  // Build master graph
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    ensureCtx();
    const ctx = ctxRef.current;
    const el1 = audioRef1.current;
    const el2 = audioRef2.current;
    if (!ctx || !el1 || !el2) return;

    const mGain = ctx.createGain();
    mGain.gain.value = masterVol / 100;
    mGainRef.current = mGain;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    if (!src1Ref.current)
      src1Ref.current = new MediaElementAudioSourceNode(ctx, {
        mediaElement: el1,
      });
    if (!src2Ref.current)
      src2Ref.current = new MediaElementAudioSourceNode(ctx, {
        mediaElement: el2,
      });

    src1Ref.current.connect(mGain);
    src2Ref.current.connect(mGain);
    mGain.connect(analyser);
    analyser.connect(ctx.destination);

    setIsReady(true);

    return () => {
      try {
        src1Ref.current?.disconnect();
        src2Ref.current?.disconnect();
        analyser.disconnect();
        mGain.disconnect();
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (mGainRef.current) {
      mGainRef.current.gain.value = masterVol / 100;
    }
  }, [masterVol]);

  // media events
  useEffect(() => {
    const el1 = audioRef1.current,
      el2 = audioRef2.current;
    if (!el1 || !el2) return;

    const h1Loaded = () =>
      setT1Dur(isFinite(el1.duration) ? el1.duration : null);
    const h2Loaded = () =>
      setT2Dur(isFinite(el2.duration) ? el2.duration : null);
    const h1Time = () => setT1Time(el1.currentTime || 0);
    const h2Time = () => setT2Time(el2.currentTime || 0);

    el1.addEventListener("loadedmetadata", h1Loaded);
    el2.addEventListener("loadedmetadata", h2Loaded);
    el1.addEventListener("timeupdate", h1Time);
    el2.addEventListener("timeupdate", h2Time);

    return () => {
      el1.removeEventListener("loadedmetadata", h1Loaded);
      el2.removeEventListener("loadedmetadata", h2Loaded);
      el1.removeEventListener("timeupdate", h1Time);
      el2.removeEventListener("timeupdate", h2Time);
    };
  }, []);

  useEffect(() => {
    if (audioRef1.current && track1Url) {
      audioRef1.current.src = track1Url;
      audioRef1.current.load();
    }
  }, [track1Url]);
  useEffect(() => {
    if (audioRef2.current && track2Url) {
      audioRef2.current.src = track2Url;
      audioRef2.current.load();
    }
  }, [track2Url]);

  useEffect(() => {
    const ctx = ctxRef.current;
    const el1 = audioRef1.current;
    const el2 = audioRef2.current;
    if (!ctx || !el1 || !el2) return;
    const onPlay = () => {
      ensureLink();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      el1.muted = el2.muted = false;
      el1.volume = el2.volume = 1;
    };
    el1.addEventListener("play", onPlay);
    el2.addEventListener("play", onPlay);
    return () => {
      el1.removeEventListener("play", onPlay);
      el2.removeEventListener("play", onPlay);
    };
  }, []);

  // playback
  function play1() {
    ensureCtx();
    ensureLink();
    ctxRef.current?.resume().finally(() => {
      if (audioRef1.current) {
        audioRef1.current.muted = false;
        audioRef1.current.volume = 1;
        audioRef1.current.play().catch(() => {});
      }
    });
  }
  function pause1() {
    audioRef1.current?.pause();
  }
  function stop1() {
    const el = audioRef1.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }
  function play2() {
    ensureCtx();
    ensureLink();
    ctxRef.current?.resume().finally(() => {
      if (audioRef2.current) {
        audioRef2.current.muted = false;
        audioRef2.current.volume = 1;
        audioRef2.current.play().catch(() => {});
      }
    });
  }
  function pause2() {
    audioRef2.current?.pause();
  }
  function stop2() {
    const el = audioRef2.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }

  // ---------- Upload + Save Helpers ----------
  async function toFileFromUrl(url: string, fallbackName: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const blob = await res.blob();
    const name = (fallbackName || "track").replace(/[^\w.\-]+/g, "_");
    return new File([blob], name, { type: blob.type || "audio/mpeg" });
  }

  function toFileFromBlobUrl(blobUrl: string, fallbackName: string) {
    return fetch(blobUrl)
      .then((r) => r.blob())
      .then(
        (b) =>
          new File(
            [b],
            ((fallbackName || "track") + ".mp3").replace(/[^\w.\-]+/g, "_"),
            { type: b.type || "audio/mpeg" }
          )
      );
  }

  function getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const a = document.createElement("audio");
      a.preload = "metadata";
      a.onloadedmetadata = () => {
        resolve(Math.round(a.duration));
        URL.revokeObjectURL(a.src);
      };
      a.onerror = reject;
      a.src = URL.createObjectURL(file);
    });
  }

  function putWithProgress(
    url: string,
    file: File,
    token: string,
    onProg: (n: number) => void
  ) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProg(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload ${xhr.status}`));
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.open("PUT", url);
      xhr.setRequestHeader("authorization", `Bearer ${token}`);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.send(file);
    });
  }

  async function saveDeck(which: 1 | 2) {
    const isDeck1 = which === 1;
    const url = isDeck1 ? track1Url : track2Url;
    const setSaving = isDeck1 ? setSaving1 : setSaving2;
    const setProg = isDeck1 ? setProg1 : setProg2;
    const setMsg = isDeck1 ? setMsg1 : setMsg2;
    const title =
      (isDeck1 ? title1 : title2) || (isDeck1 ? "Deck A" : "Deck B");

    try {
      if (!url) return setMsg("Pick or load a track first.");
      setSaving(true);
      setProg(0);
      setMsg("");

      let file: File;
      if (url.startsWith("blob:")) file = await toFileFromBlobUrl(url, title);
      else file = await toFileFromUrl(url, title);

      const signRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, bucket: "media" }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Sign failed");

      await putWithProgress(sign.signedUrl, file, sign.token, setProg);

      const durationSec = await getAudioDuration(file).catch(() => null);
      const userId = "demo-user-id";

      const saveRes = await fetch("/api/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: "",
          publicUrl: sign.publicUrl,
          storagePath: sign.path,
          userId,
          durationSec,
        }),
      });
      const saved = await saveRes.json();
      if (!saveRes.ok) throw new Error(saved.error || "Save failed");

      setMsg("✅ Saved!");
      router.push(`/tracks/${saved.track.id}`);
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Save error"}`);
    } finally {
      setSaving(false);
    }
  }

  // ---------- UI ----------
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold flex items-center justify-between">
        <span>Musiq Pro</span>
        <button
          className="btn-secondary"
          onClick={() => window.open("/docs/quickstart", "_blank")}
        >
          ❓ Quick Start Guide
        </button>
      </h1>

      <div className="flex items-center gap-3">
        <button className="btn-secondary" onClick={unlockCtx}>
          🔓 Unlock Audio {ctxUnlocked ? "✓" : ""}
        </button>
        <span className="text-sm text-neutral-400">
          {ctxUnlocked ? "Audio ready" : "Click to enable audio"}
        </span>
      </div>

      {/* Master */}
      <div className="card space-y-3">
        <label className="block font-medium">Master Volume</label>
        <input
          type="range"
          min={0}
          max={100}
          value={masterVol}
          onChange={(e) => setMasterVol(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-neutral-400">{masterVol}%</div>
        <Visualizer analyser={analyserRef} />
      </div>

      {/* Deck 1 */}
      <div className="card space-y-3">
        <h2 className="font-semibold">Track 1 (Deck A)</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            className="input"
            value={title1}
            onChange={(e) => setTitle1(e.target.value)}
            placeholder="Title for Deck A"
          />
          <input
            type="text"
            className="input"
            value={track1Url ?? ""}
            placeholder="/audio/sample-beat.mp3 or https://..."
            onChange={(e) => setTrack1Url(e.target.value || null)}
          />
          <label className="btn-secondary cursor-pointer">
            Upload…
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (!f) return;
                const url = URL.createObjectURL(f);
                setTrack1Url(url);
              }}
              className="hidden"
            />
          </label>
          <button className="btn-primary" onClick={play1} disabled={!isReady}>
            Play
          </button>
          <button className="btn-secondary" onClick={pause1}>
            Pause
          </button>
          <button className="btn-secondary" onClick={stop1}>
            Stop
          </button>
          <button
            className="btn-secondary"
            onClick={() => setTrack1Url("/audio/sample-beat.mp3")}
          >
            Load Sample
          </button>
          <button
            className="btn-primary"
            onClick={() => saveDeck(1)}
            disabled={!track1Url || saving1}
          >
            {saving1 ? `Saving… ${prog1}%` : "Save to Library"}
          </button>
        </div>

        <audio
          ref={audioRef1}
          controls
          preload="metadata"
          crossOrigin="anonymous"
          className="w-full mt-2"
          src={track1Url ?? undefined}
        />
        <div className="text-sm text-neutral-400">
          {fmt(t1Time)} / {fmt(t1Dur)}{" "}
          {msg1 && <span className="ml-2">{msg1}</span>}
        </div>
      </div>

      {/* Deck 2 */}
      <div className="card space-y-3">
        <h2 className="font-semibold">Track 2 (Deck B)</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            className="input"
            value={title2}
            onChange={(e) => setTitle2(e.target.value)}
            placeholder="Title for Deck B"
          />
          <input
            type="text"
            className="input"
            value={track2Url ?? ""}
            placeholder="Paste a URL or /audio/... path"
            onChange={(e) => setTrack2Url(e.target.value || null)}
          />
          <label className="btn-secondary cursor-pointer">
            Upload…
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (!f) return;
                const url = URL.createObjectURL(f);
                setTrack2Url(url);
              }}
              className="hidden"
            />
          </label>
          <button className="btn-primary" onClick={play2} disabled={!isReady}>
            Play
          </button>
          <button className="btn-secondary" onClick={pause2}>
            Pause
          </button>
          <button className="btn-secondary" onClick={stop2}>
            Stop
          </button>
          <button
            className="btn-secondary"
            onClick={() => setTrack2Url("/audio/sample-beat.mp3")}
          >
            Load Sample
          </button>
          <button
            className="btn-primary"
            onClick={() => saveDeck(2)}
            disabled={!track2Url || saving2}
          >
            {saving2 ? `Saving… ${prog2}%` : "Save to Library"}
          </button>
        </div>

        <audio
          ref={audioRef2}
          controls
          preload="metadata"
          crossOrigin="anonymous"
          className="w-full mt-2"
          src={track2Url ?? undefined}
        />
        <div className="text-sm text-neutral-400">
          {fmt(t2Time)} / {fmt(t2Dur)}{" "}
          {msg2 && <span className="ml-2">{msg2}</span>}
        </div>
      </div>

      {/* Effects Rack */}
      <EffectsRack
        ctxRef={ctxRef}
        inputRef={mGainRef}
        outputRef={analyserRef}
      />
    </main>
  );
}
