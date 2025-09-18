import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'philips-draw-sent-cayman.trycloudflare.com',
      '.trycloudflare.com'
    ],
  },
  build: {
    outDir: 'dist',
  },
  css: {
    postcss: './postcss.config.js',
  },
})