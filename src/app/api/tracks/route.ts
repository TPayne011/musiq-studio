// src/app/api/tracks/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Health check
export async function GET() {
  return NextResponse.json({ ok: true });
}

/**
 * POST /api/tracks
 * Body: { title, publicUrl, storagePath, userId?, description?, durationSec?, artworkUrl?, waveformJson? }
 * Notes:
 *  - We DO NOT trust/require client userId (dev mode).
 *  - We upsert a demo user and connect via relation (safer than raw userId).
 *  - We map publicUrl -> audioUrl for the Prisma model.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      publicUrl,
      storagePath,
      description,
      durationSec,
      artworkUrl,
      waveformJson,
    } = body || {};

    if (!title || !publicUrl || !storagePath) {
      return NextResponse.json(
        { error: "Missing required fields: title, publicUrl, storagePath" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Ensure demo user exists (email assumed unique in your schema)
      const demo = await tx.user.upsert({
        where: { email: "demo@musiq.local" },
        update: {},
        create: { email: "demo@musiq.local", name: "Musiq Demo" },
      });

      // Double-check it really exists (defensive)
      const exists = await tx.user.findUnique({ where: { id: demo.id } });
      if (!exists) throw new Error("Demo user not found after upsert");

      // Create Track by CONNECTING the relation (no raw userId)
      const track = await tx.track.create({
        data: {
          title,
          description: description ?? "",
          audioUrl: publicUrl, // map from publicUrl
          storagePath,
          durationSec: durationSec ?? null,
          artworkUrl: artworkUrl ?? null,
          waveformJson: waveformJson ?? null,
          user: { connect: { id: demo.id } }, // <-- relation-safe
        },
        include: { user: { select: { id: true, email: true } } },
      });

      return { track, demoUserId: demo.id };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    // Surface helpful context if this trips again
    return NextResponse.json(
      { error: e?.message || "create error", hint: "FK connect flow failed" },
      { status: 500 }
    );
  }
}
