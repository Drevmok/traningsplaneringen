import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initBank, refreshBank } from './lib/bank'
import { shouldStartAdmin } from './lib/admin/state'
import { cleanAuthLeftovers } from './lib/admin/authReturn'

// Slice 33: an old login link from a mail (?code= / ?error_code=) only gets a clean address
// (#dela= and other params kept). Nothing is read from it and no admin code loads for it.
const cleanUrl = cleanAuthLeftovers(window.location.href)
if (cleanUrl) window.history.replaceState(window.history.state, '', cleanUrl)

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

// Slice 32/33: admin code (and supabase-js) loads only for a saved admin session in this
// browser. A coach visit never gets here.
if (shouldStartAdmin()) void import('./lib/admin/session').then((m) => m.startAdmin())
