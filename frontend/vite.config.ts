import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    proxy: {
      '/local': {
        target: 'http://localhost:8081/',
        changeOrigin: true,
        secure: false
      },
      '/api/get': {
        target: 'http://localhost:8081/api',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
