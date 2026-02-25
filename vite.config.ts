import path from 'node:path'

import inertia from '@adonisjs/inertia/vite'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    inertia({ ssr: { enabled: false } }),
    tailwindcss(),
    adonisjs({
      entrypoints: ['resources/css/app.css', 'inertia/app.tsx'],
      reload: ['resources/views/**/*.edge'],
    }),
  ],
  server: {
    allowedHosts: ['starter-template-96pc.onrender.com', 'togetha.outray.app'],
  },
  resolve: {
    alias: {
      '~/': `${import.meta.dirname}/`,
      '@': path.resolve(__dirname, './inertia'),
    },
  },
})
