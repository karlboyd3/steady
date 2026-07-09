import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Steady — Knee Strength & Mobility",
    short_name: "Steady",
    description:
      "A gentle, progressive 30-day program of guided exercises to strengthen the muscles that support your knees and improve mobility.",
    start_url: "/",
    scope: "/",
    lang: "en-US",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait",
    background_color: "#EFF4F1",
    theme_color: "#245446",
    categories: ["health", "fitness", "medical"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/screenshots/home.png",
        sizes: "1080x2400",
        type: "image/png",
        form_factor: "narrow",
        label: "Your 30-day plan at a glance",
      },
      {
        src: "/screenshots/session.png",
        sizes: "1080x2400",
        type: "image/png",
        form_factor: "narrow",
        label: "Guided exercises with timers and rep pacing",
      },
      {
        src: "/screenshots/rest.png",
        sizes: "1080x2400",
        type: "image/png",
        form_factor: "narrow",
        label: "Built-in rest between exercises",
      },
    ],
  };
}
