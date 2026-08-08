import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const twibbons = [
  {
    id: 1,
    title: "OPEN RECRUITMENT STAF BEM UNSOED 2026",
    slug: "OprecBEMUnsoed2026",
    description: "Halo, Soedirman muda!...",
    type: "IMAGE",
    overlayFile: "/twibbon/overlay_oprec.png",
    thumbnail: "/twibbon/thumbnail_oprec.png",
    config: { overlayOpacity: 1, framePosition: "cover" },
    isActive: true,
    downloadsCount: 0,
  },
  {
    id: 2,
    title: "Soedirman Student Summit 2026",
    slug: "S3",
    description: "Twibbon resmi untuk mahasiswa baru Unsoed angkatan 2026.",
    type: "VIDEO",
    overlayFile: "/twibbon/overlay_s3.webm",
    thumbnail: "/twibbon/thumbnail_s3.jpg",
    config: {
      overlayOpacity: 1,
      framePosition: "cover",
      chromaColor: "#00FF00",
    },
    isActive: true,
    downloadsCount: 0,
  }
];

async function main() {
  console.log("Mulai menyalin mock data ke Supabase...");
  
  for (const t of twibbons) {
    await prisma.twibbon.upsert({
      where: { id: t.id },
      update: {}, // Jika sudah ada, biarkan saja
      create: {
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.description,
        type: t.type,
        overlayFile: t.overlayFile,
        thumbnail: t.thumbnail,
        config: t.config,
        isActive: t.isActive,
        downloadsCount: t.downloadsCount,
      },
    });
    console.log(`✅ Berhasil insert: ${t.title}`);
  }
  
  console.log("Selesai!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
