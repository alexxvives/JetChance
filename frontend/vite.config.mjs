import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 8000,
    host: true,
    // Remove HTTPS for now - Stripe should work with localhost over HTTP
  },
});
