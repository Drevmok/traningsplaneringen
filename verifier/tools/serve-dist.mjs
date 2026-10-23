// Slice 50: tiny static preview of a built dist under /traningsplaneringen/ (SPA fallback to index.html).
//   node verifier/tools/serve-dist.mjs <dist-dir> <port>
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'
const [dir, port] = process.argv.slice(2)
const BASE = '/traningsplaneringen/'
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain' }
createServer(async (req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0])
  if (!url.startsWith(BASE)) { res.writeHead(url === '/traningsplaneringen' ? 301 : 404, { Location: BASE }); return res.end() }
  let p = normalize(join(dir, url.slice(BASE.length)))
  if (!p.startsWith(normalize(dir))) { res.writeHead(403); return res.end() }
  try { if ((await stat(p)).isDirectory()) p = join(p, 'index.html') } catch { p = join(dir, 'index.html') }
  try { const b = await readFile(p); res.writeHead(200, { 'Content-Type': TYPES[extname(p)] ?? 'application/octet-stream' }); res.end(b) }
  catch { res.writeHead(404); res.end() }
}).listen(Number(port), '127.0.0.1', () => console.log(`serving ${dir} on :${port}${BASE}`))
