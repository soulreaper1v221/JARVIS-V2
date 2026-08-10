import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { VitePWA } from 'vite-plugin-pwa';

// JARVIS-V2 build configuration.
// react()  -> JSX transform
// tailwindcss() -> Tailwind CSS v4 processing
// VitePWA  -> optional PWA hooks (kept inert: no manifest, no service worker)
// viteSingleFile() -> inlines every asset into a single index.html
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: false,
      disable: true, // single-file build: no service worker generation
    }),
    viteSingleFile(),
  ],
  server: {
    host: true,
    allowedHosts: true, // sandbox preview host
  },
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 2048,
    reportCompressedSize: false,
  },
});
