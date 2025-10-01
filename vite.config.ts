import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000
  },
  esbuild: {
    // Remove console statements in production builds
    drop: ['console', 'debugger']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and React DOM
          'react-vendor': ['react', 'react-dom'],
          // Router
          'router': ['react-router-dom'],
          // Chart library (recharts is quite large)
          'charts': ['recharts'],
          // HTTP client
          'http': ['axios'],
          // State management
          'state': ['jotai'],
          // Markdown rendering
          'markdown': ['react-markdown']
        }
      }
    },
    // Increase chunk size warning limit to 1000kb temporarily
    chunkSizeWarningLimit: 1000
  }
})
