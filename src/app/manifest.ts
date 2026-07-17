import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "GymMaster - Hệ thống vận hành phòng gym",
    short_name: "GymMaster",
    description:
      "Không gian vận hành, huấn luyện và theo dõi sức khỏe dành cho phòng gym GymMaster.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F4F4F5",
    theme_color: "#18181B",
    lang: "vi",
    categories: ["fitness", "health", "productivity"],
    icons: [
      {
        src: "/icons/gymmaster-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/gymmaster-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/gymmaster-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
