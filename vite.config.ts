/*
 / My-Informatics-Journal - A project from Informatics class on 05/09/2025
 / Copyright (C) 2025 ChosenSoul
 /
 / This program is free software: you can redistribute it and/or modify
 / it under the terms of the GNU General Public License as published by
 / the Free Software Foundation, either version 3 of the License, or
 / (at your option) any later version.

 / This program is distributed in the hope that it will be useful,
 / but WITHOUT ANY WARRANTY; without even the implied warranty of
 / MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 / GNU General Public License for more details.

 / You should have received a copy of the GNU General Public License
 / along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
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
          globPatterns: ['**/*.{ico,png,jpg,jpeg,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages',
                networkTimeoutSeconds: 3
              }
            },
            {
              urlPattern: /\.(?:html|css|js)$/i,
              handler: 'NetworkOnly',
              options: {
                cacheName: 'no-cache'
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|otf)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'assets',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 7 * 24 * 60 * 60
                }
              }
            },
            {
              urlPattern: '/offline',
              handler: 'CacheFirst',
              options: {
                cacheName: 'offline-page',
                expiration: {
                  maxEntries: 1
                }
              }
            }
          ],
          navigateFallback: '/offline',
          navigateFallbackDenylist: [/^\/offline$/],
        }
      }),
    ],
    define: {
      'import.meta.env.GA_TRACKING_ID': JSON.stringify(env.GA_TRACKING_ID || 'G-XXXXXXXXXX'),
    },
  };
});