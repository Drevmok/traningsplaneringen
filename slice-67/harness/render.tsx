// Slice 67 step 1 — render each proposal with the real StationSketch (throwaway harness, not app code).
// Run from app/: bun ../slice-67/harness/render.tsx
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { StationSketch } from '../../app/src/components/StationSketch'
import { sanitizeStationLayout } from '../../app/src/data/stationLayout'
import { PROPOSALS } from './proposals.mjs'

const dir = new URL('..', import.meta.url).pathname
const queue = JSON.parse(readFileSync(dir + 'live-queue.json', 'utf8')) as Array<{ id: string; title: string; equipment: { pieceId: string; count: number }[]; how_to: string }>
mkdirSync(dir + 'layouts', { recursive: true })
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
const cards: string[] = []
const all: Record<string, unknown> = {}
for (const ex of queue) {
  const p = (PROPOSALS as Record<string, { layout: any; note: string; unsure?: string }>)[ex.id]
  if (!p) throw new Error('no proposal for ' + ex.id)
  if (!sanitizeStationLayout(p.layout, ex.equipment)) throw new Error('invalid layout (poses must match redskap 1:1) for ' + ex.id)
  writeFileSync(`${dir}layouts/${ex.id}.json`, JSON.stringify(p.layout, null, 2) + '\n')
  all[ex.id] = p.layout
  const after = renderToStaticMarkup(<StationSketch slots={ex.equipment} layout={p.layout} />)
  const before = renderToStaticMarkup(<StationSketch slots={ex.equipment} />)
  const gear = ex.equipment.map((s) => (s.count > 1 ? `${s.count}× ` : '') + s.pieceId.replace('eq-', '')).join(', ')
  cards.push(`<section class="card${p.unsure ? ' unsure' : ''}" id="${ex.id}">
<h2>${esc(ex.title)}</h2><p class="id">${ex.id} · ${esc(gear)}</p>
<div class="pair"><div><h3>Förslag</h3>${after}</div><div class="before"><h3>Automatisk rad i dag</h3>${before}</div></div>
<p class="note">${esc(p.note)}</p>${p.unsure ? `<p class="flag">Osäker: ${esc(p.unsure)}</p>` : ''}
<details><summary>how_to</summary><pre>${esc(ex.how_to)}</pre></details></section>`)
}
writeFileSync(dir + 'layouts/all-proposals.json', JSON.stringify(all, null, 2) + '\n')
const css = `body{font:15px/1.4 system-ui,sans-serif;margin:0;padding:12px;background:#f5f5f4;color:#1c1917}h1{font-size:20px;margin:4px 0 12px}
.card{background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:10px 12px;margin:0 0 12px}.card.unsure{border-color:#f59e0b}
h2{font-size:16px;margin:0}h3{font-size:12px;margin:6px 0 2px;color:#57534e;font-weight:600}.id{margin:0;color:#78716c;font-size:12px}
.pair{display:grid;gap:6px}.before{opacity:.75}figure{margin:0}.station-sketch{width:100%;height:auto;max-height:180px;display:block}
.station-sketch-caption{display:none}.note{margin:6px 0 0}.flag{margin:4px 0 0;color:#b45309;font-size:13px}pre{white-space:pre-wrap;font-size:12px;margin:4px 0 0}
@media (min-width:700px){.pair{grid-template-columns:1fr 1fr}}`
writeFileSync(dir + 'previews/index.html', `<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Slice 67 — skissförslag</title><style>${css}</style></head><body>
<h1>Slice 67 — skissförslag (${queue.length} i live-kön)</h1><p>Varje kort: förslag överst, dagens automatiska rad under. Orange ram = osäker.</p>${cards.join('\n')}</body></html>`)
console.log('rendered', queue.length)
