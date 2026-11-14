import type { MetadataRoute } from "next";

// /manifest.webmanifest — name, colours and icons for "Add to home screen".
// The icons are the files next to this one: app/icon.svg (the emblem of
// public/homepage/logo-header.svg), app/apple-icon.png and app/favicon.ico.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Joy Maa Tara Bama Kripa",
    short_name: "JMT",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf7",
    theme_color: "#f26921",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/favicon.ico", sizes: "48x48 32x32 16x16", type: "image/x-icon" },
    ],
  };
}
