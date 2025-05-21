import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { type ManifestOptions } from 'vite-plugin-pwa';

const manifest: Partial<ManifestOptions> = {
  name: 'Мій проєкт портфоліо з інформатики',
  short_name: 'ChosenSoul портфоліо',
  description: 'Мій проєкт портфоліо з інформатики, де я ділюся тим, чому навчився протягом цього навчального року з програмування, алгоритмів та інших тем інформатики.',
  start_url: '/',
  display: 'standalone',
  background_color: '#3d3c3c',
  theme_color: '#000000',
  lang: 'uk',
  icons: [
    {
      src: '/assets/icon_light-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/assets/icon_light-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: manifest,
        workbox: {
          maximumFileSizeToCacheInBytes: 10485760,
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages',
                networkTimeoutSeconds: 3,
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|woff|woff2|ttf|otf)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'assets',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
              },
            },
            {
              urlPattern: '/offline',
              handler: 'CacheFirst',
              options: {
                cacheName: 'offline-page',
                expiration: {
                  maxEntries: 1,
                },
              },
            },
          ],
          navigateFallback: '/offline',
          navigateFallbackDenylist: [/^\/offline$/],
        },
      }),
    ],
    define: {
      'import.meta.env.GA_TRACKING_ID': JSON.stringify(env.GA_TRACKING_ID || 'G-XXXXXXXXXX'),
    },
  };
});