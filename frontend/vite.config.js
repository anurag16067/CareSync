import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    port:5173,
    // same-origin /api in development, like the Vercel rewrite in production
    proxy: { '/api': 'http://localhost:4000' },
  }
})
