import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const revalidate = 3600; // Revalidate sitemap at most every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://twibbon.bem-unsoed.com";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/twibbons`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const twibbons = await prisma.twibbon.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
        thumbnail: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const dynamicRoutes: MetadataRoute.Sitemap = twibbons.map((twibbon) => {
      const imageUrl = twibbon.thumbnail
        ? twibbon.thumbnail.startsWith("http")
          ? twibbon.thumbnail
          : `${baseUrl}${twibbon.thumbnail}`
        : undefined;

      return {
        url: `${baseUrl}/${twibbon.slug}`,
        lastModified: twibbon.updatedAt ? new Date(twibbon.updatedAt) : new Date(twibbon.createdAt),
        changeFrequency: "weekly",
        priority: 0.8,
        images: imageUrl ? [imageUrl] : undefined,
      };
    });

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Gagal mengambil data sitemap:", error);
    return staticRoutes;
  }
}
