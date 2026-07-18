import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'ChuoSurvivor',
        short_name: 'ChuoSurvivor',
        description: 'Your study companion, available even without a connection.',
        theme_color: '#ffffff',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [{
          // The large local model is deliberately cached only after the user enables it.
          urlPattern: /^https:\/\/huggingface\.co\/litert-community\/gemma-4-E2B-it-litert-lm\/resolve\//,
          handler: 'CacheFirst',
          options: { cacheName: 'gemma-4-e2b-model' },
        }],
      },
    }),
  ],
})
