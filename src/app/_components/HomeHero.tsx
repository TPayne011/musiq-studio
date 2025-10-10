// src/app/_components/HomeHero.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomeHero() {
  return (
    <>
      {/* Animated background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.65, scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="absolute -top-32 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(168,85,247,.55) 0%, rgba(59,130,246,.35) 40%, rgba(0,0,0,0) 70%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 0.45, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="absolute bottom-[-10%] left-[-10%] h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,.40) 0%, rgba(139,92,246,.25) 45%, rgba(0,0,0,0) 70%)",
          }}
        />
      </div>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight md:text-6xl"
        >
          Create. Mint. Own.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mx-auto mt-4 max-w-2xl text-lg text-gray-300"
        >
          A next-gen Web3 music studio for Pioneers.{" "}
          <span className="font-semibold">Only on Pi Network.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Link
            href="/studio"
            className="rounded-xl bg-white/10 px-6 py-3 font-medium backdrop-blur-md ring-1 ring-white/20 hover:bg-white/15"
          >
            Enter Studio
          </Link>
          <Link
            href="/about"
            className="rounded-xl bg-gradient-to-r from-fuchsia-500/80 to-indigo-500/80 px-6 py-3 font-medium shadow-[0_0_30px_rgba(168,85,247,.35)] hover:shadow-[0_0_40px_rgba(168,85,247,.55)]"
          >
            Meet the Movement
          </Link>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, delay: 0.25 }}
          className="mx-auto mt-10 h-[2px] w-[240px] origin-left bg-gradient-to-r from-fuchsia-500 to-indigo-400"
        />
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-16 md:grid-cols-3">
        {[
          {
            title: "🎧 Create",
            body: "Compose with intuitive tools and real-time feedback.",
          },
          {
            title: "💿 Mint",
            body: "Turn tracks into NFTs inside the Pi ecosystem.",
          },
          {
            title: "🌍 Own",
            body: "Keep your rights. Earn Pi. Share your sound.",
          },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * i }}
            className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md hover:bg-white/[0.07]"
          >
            <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
            <p className="text-gray-300">{f.body}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} Musiq Studio</span>
          <span>Only on Pi Network</span>
        </div>
      </footer>
    </>
  );
}
