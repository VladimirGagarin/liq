import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { prerender } from './prerender-plugin.js'
import { withBase } from './src/site.config.js'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the built site from a subpath, so every asset URL needs that
  // prefix. Taken from SITE_URL so the origin and the base cannot drift apart.
  base: withBase('/'),
  plugins: [react(), prerender()],
})
