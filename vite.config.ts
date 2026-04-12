import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
  ],
  optimizeDeps: {
    include: ['react-is', 'recharts'],
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    commonjsOptions: {
      include: [/react-is/, /node_modules/],
    },
  },
})
