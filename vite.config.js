import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: true, // Listen on all network interfaces (127.0.0.1, localhost, 0.0.0.0)
    port: 3000,
    allowedHosts: ['shanty-crucial-retinal.ngrok-free.dev'],
    watch: {
      ignored: ['**/server/**']
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
