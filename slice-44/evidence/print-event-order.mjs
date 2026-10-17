import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage()
await p.goto('http://localhost:4544/traningsplaneringen/')
const r = await p.evaluate(() => new Promise(res => { const log=[]; addEventListener('beforeprint',()=>log.push('beforeprint')); addEventListener('afterprint',()=>log.push('afterprint')); log.push('call'); window.print(); log.push('returned'); setTimeout(()=>res(log),500) }))
console.log(r); await b.close()
