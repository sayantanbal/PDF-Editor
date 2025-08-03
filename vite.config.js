import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'pdfjs-dist/build/pdf.worker.min.mjs': 'pdfjs-dist/build/pdf.worker.min.mjs'
    }
  },
  optimizeDeps: {
    include: [
      'pdfjs-dist/build/pdf',
      'pdfjs-dist/build/pdf.worker.min.mjs'
    ]
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  define: {
    'process.env': {}
  },
  worker: {
    format: 'es'
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  }
})
