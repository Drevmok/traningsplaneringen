import { useEffect, useState } from 'react'
import { UI } from '../data/blockMeta'
import { loadClubEquipmentAdmin, saveClubEquipment } from '../lib/admin/clubEquipmentWrite'

/** Mirrors EQUIPMENT_PIECES id + label; kept local so the admin chunk does not split the library out of the main bundle. */
const PIECES = [
  ['eq-trampett', 'Trampett'],
  ['eq-satsbrada', 'Satsbräda'],
  ['eq-plint', 'Plint'],
  ['eq-landningsmatta', 'Landningsmatta'],
  ['eq-tumblingmatta', 'Tumblingmatta'],
  ['eq-madrass', 'Madrass'],
  ['eq-mattberg', 'Mattberg'],
  ['eq-flickiskudde', 'Flickiskudde'],
  ['eq-airtrack', 'Airtrack'],
  ['eq-kon', 'Kon'],
  ['eq-kilmatta', 'Kilmatta'],
  ['eq-skumblock', 'Skumblock'],
  ['eq-bom', 'Bom'],
  ['eq-racke', 'Räcke'],
  ['eq-rockring', 'Rockring'],
] as const

const COPY = {
  title: 'Föreningens redskap',
  hint: 'Kryssa för det ni har. Stationsbygget visar sedan vad som saknas. Inte ifyllt än räknas alla 15 som tillgängliga.',
  save: 'Spara redskap',
  saved: 'Sparad.',
} as const

interface Props {
  onToast: (msg: string) => void
}

/** Slice 68 B1 — checkboxes for the 15 library pieces. Admin only. */
export function ClubEquipmentAdmin({ onToast }: Props) {
  const [on, setOn] = useState<Set<string>>(() => new Set())
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void loadClubEquipmentAdmin().then((r) => {
      if (r.filled) setOn(new Set(r.ids))
    })
  }, [])

  async function save() {
    if (busy) return
    setBusy(true)
    const result = await saveClubEquipment([...on])
    setBusy(false)
    onToast(result === 'ok' ? COPY.saved : result === 'offline' ? UI.clubOffline : UI.clubWriteFailed)
  }

  return (
    <section className="admin-area-section" aria-label={COPY.title}>
      <h3 className="template-group">{COPY.title}</h3>
      <p className="muted">{COPY.hint}</p>
      <ul className="template-list">
        {PIECES.map(([id, label]) => (
          <li key={id}>
            <label>
              <input
                type="checkbox"
                checked={on.has(id)}
                onChange={() =>
                  setOn((prev) =>
                    prev.has(id) ? new Set([...prev].filter((x) => x !== id)) : new Set(prev).add(id),
                  )
                }
              />{' '}
              {label}
            </label>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-primary" disabled={busy} onClick={() => void save()}>
        {COPY.save}
      </button>
    </section>
  )
}
