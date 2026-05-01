import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/menu': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/order': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/kitchen': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
