import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/** version.json matches the build id baked into the client as VITE_APP_BUILD. */
function appVersionFile(): Plugin {
  return {
    name: 'app-version-file',
    generateBundle() {
      const build = process.env.VITE_APP_BUILD || 'dev'
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ build }),
      })
    },
  }
}

// https://vite.dev/config/
// GitHub project Pages default; override with VITE_BASE (trailing slash).
export default defineConfig({
  plugins: [react(), appVersionFile()],
  base: process.env.VITE_BASE ?? '/traningsplaneringen/',
})
