import type { ReactNode } from 'react'
import { UI } from '../data/blockMeta'
import type { ClubSnapshot, ClubTemplate } from '../lib/clubStore'

/** Slice 36 — one club card. Coaches: just the button (no actions). Admin adds `extra` below. */
export function ClubTemplateCard({ template, onPick, extra, badge }: { template: ClubTemplate; onPick: (t: ClubTemplate) => void; extra?: ReactNode; badge?: ReactNode }) {
  return (
    <li className="template-saved template-club">
      <button
        type="button"
        className="template-card"
        aria-label={UI.clubTemplateCardAria.replace('{title}', template.title).replace('{n}', String(template.totalMinutes))}
        onClick={() => onPick(template)}
      >
        <strong>{template.title}</strong>
        <span className="template-meta">
          {template.totalMinutes} min {badge ?? <span className="club-badge">{UI.clubTemplateBadge}</span>}
        </span>
      </button>
      {extra}
    </li>
  )
}

/** HANDOFF §2 states: none → nothing; stale + never reached + empty → nothing. */
export function clubSectionVisible(club: ClubSnapshot): boolean {
  return club.items.length > 0 || club.status === 'fresh'
}

/** Coach view of «Föreningens mallar» (also the admin fallback while the admin chunk loads). */
export function ClubTemplatesSection({ club, onPick }: { club: ClubSnapshot; onPick: (t: ClubTemplate) => void }) {
  if (!clubSectionVisible(club)) return null
  return (
    <section className="club-templates" aria-label={UI.clubTemplatesTitle}>
      <h3 className="template-group">{UI.clubTemplatesTitle}</h3>
      <p className="muted">{UI.clubTemplatesHint}</p>
      {club.status === 'stale' && <p className="bank-stale">{UI.clubTemplatesStale}</p>}
      {club.items.length === 0 ? (
        <p className="muted">{UI.clubTemplatesEmpty}</p>
      ) : (
        <ul className="template-list">
          {club.items.map((t) => (
            <ClubTemplateCard key={t.id} template={t} onPick={onPick} />
          ))}
        </ul>
      )}
    </section>
  )
}
