import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['paper-film-mark.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Paper Film - Ciné-Roman Creator',
        short_name: 'Paper Film',
        description:
          'Turn any film or video and its subtitles into a polished, printable contact sheet — a visual storyboard of every line of dialogue.',
        theme_color: '#0f141e',
        background_color: '#0f141e',
        display: 'standalone',
        scope: '/paper-film/',
        start_url: '/paper-film/',
        orientation: 'any',
        categories: ['productivity', 'utilities', 'photo'],
        icons: [
          {
            src: '/paper-film/paper-film-mark.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/paper-film/paper-film-mark.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'maskable'
          },
          {
            src: '/paper-film/paper-film-mark.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'New Project',
            short_name: 'New',
            description: 'Start a new ciné-roman project',
            url: '/paper-film/'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  base: '/paper-film/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  }
});
