import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/hiper-lokal-platform/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
}) 