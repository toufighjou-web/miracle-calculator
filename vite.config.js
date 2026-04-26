import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Change base if you host in a subfolder, e.g. '/calc/'
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
