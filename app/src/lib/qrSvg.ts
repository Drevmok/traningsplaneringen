import { renderSVG } from './uqr.mjs'

export function qrSvg(data: string): string {
  return renderSVG(data, { pixelSize: 3, border: 2 })
}
