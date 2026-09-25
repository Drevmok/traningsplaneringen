import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub project Pages default; override with VITE_BASE (trailing slash).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/traningsplaneringen/',
})
