import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initBank, refreshBank } from './lib/bank'
import { shouldStartAdmin } from './lib/admin/state'

// Slice 31 (D1): start from the saved copy (or the bundled seeds) before first render.
initBank()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// …then ask the shared bank for news once, in the background. Bank off → no request.
setTimeout(() => {
  void refreshBank()
}, 0)

// Slice 32: admin code (and supabase-js) loads only for a login return or a saved admin
// session in this browser. A coach visit never gets here.
if (shouldStartAdmin()) void import('./lib/admin/session').then((m) => m.startAdmin())
