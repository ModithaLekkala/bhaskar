// vite.config.js
// -----------------------------------------------------------------------
// This is the build/dev-server configuration for Vite (the tool that runs
// your React app locally and bundles it for production).
// We only need the React plugin here — nothing fancy.
// -----------------------------------------------------------------------
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // auto-opens the browser when you run `npm run dev`
  },
})
