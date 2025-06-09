import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { readFileSync } from "fs";

// Read package.json for version info
const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf8"));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
    'import.meta.env.VITE_BUILD_HASH': JSON.stringify(
      process.env.VERCEL_GIT_COMMIT_SHA || 
      process.env.GITHUB_SHA || 
      Date.now().toString()
    ),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      workbox: {
        skipWaiting: false,
        clientsClaim: false,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // Exclude auth requests from caching
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/auth/, /supabase/],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        name: "LogYourBody - Body Composition Tracker",
        short_name: "LogYourBody",
        description: "Track your body composition with precision. Monitor body fat percentage, weight, FFMI, and lean body mass.",
        theme_color: "#0073ff",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        id: "/",
        version: packageJson.version,
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any",
          },
        ],
        categories: ["health", "fitness", "lifestyle"],
        lang: "en",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
