import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: !isVercel ? {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  } : undefined,
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [],
    },
  },
})
