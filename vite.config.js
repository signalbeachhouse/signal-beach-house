import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: './src',
  build: {
    outDir: '../public',
    emptyOutDir: true,
  },
  server: {
    historyApiFallback: true, // 👈 enables client-side routing in dev
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
