import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
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
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI components library
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-button',
            '@radix-ui/react-card',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch'
          ],
          // Data/API related
          'data-vendor': [
            '@supabase/supabase-js',
            '@tanstack/react-query',
            '@revenuecat/purchases-js'
          ],
          // Icons and UI utilities
          'utils-vendor': [
            'lucide-react',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'cmdk',
            'sonner',
            'vaul'
          ],
          // Charts and 3D (heavy libraries)
          'charts-vendor': [
            'recharts',
            '@react-three/fiber',
            'three'
          ],
          // Analytics and monitoring
          'analytics-vendor': [
            '@vercel/analytics',
            '@vercel/speed-insights'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: mode === 'development',
    // Minification optimizations
    minify: 'esbuild',
    // Asset optimization
    assetsInlineLimit: 4096,
  },
  plugins: [
    react(),
    
    // Bundle analyzer (only in analyze mode)
    ...(mode === 'analyze' ? [visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })] : []),
    VitePWA({
      registerType: "prompt",
      workbox: {
        skipWaiting: false,
        clientsClaim: false,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}"],
        // Enhanced caching strategies
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200],
              },
              backgroundSync: {
                name: "api-background-sync",
                options: {
                  maxRetentionTime: 24 * 60, // 24 hours in minutes
                },
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
            },
          },
          {
            urlPattern: /^https:\/\/supabase\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
        ],
        // Exclude auth requests from caching
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/auth/, /api\/auth/],
        // Additional performance optimizations
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        // Exclude development files from precaching
        globIgnores: [
          "**/node_modules/**/*",
          "**/dev-dist/**/*",
          "**/*.map",
          "**/sw.js",
          "**/workbox-*.js"
        ],
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
