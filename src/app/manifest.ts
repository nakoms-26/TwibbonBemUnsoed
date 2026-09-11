import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Twibbon BEM Unsoed",
    short_name: "Twibbon BEM",
    description: "Platform Resmi Pembuatan Twibbon Foto & Video BEM Universitas Jenderal Soedirman",
    start_url: "/",
    display: "standalone",
    background_color: "#1e0a4a",
    theme_color: "#1e0a4a",
    icons: [
      {
        src: "/favicon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
