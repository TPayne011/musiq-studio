// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create or reuse a demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@musiq.dev" },
    update: {},
    create: {
      email: "demo@musiq.dev",
      name: "Demo Artist",
      image: "https://avatars.githubusercontent.com/u/000?v=4",
    },
  });

  // Create or reuse a demo track
  await prisma.track.upsert({
    where: { id: "seed-track" },
    update: {},
    create: {
      id: "seed-track",
      title: "First Light (Demo)",
      description: "Example track for Musiq-Studio setup",
      audioUrl:
        "https://cdn.pixabay.com/download/audio/2022/03/15/audio_b318c6e7a3.mp3?filename=calm-piano-ambient-110997.mp3",
      storagePath: "audio/demo.mp3",
      artworkUrl: "https://picsum.photos/300/300",
      durationSec: 30,
      userId: user.id,
    },
  });
}

main()
  .then(async () => {
    console.log("✅ Seed complete");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
