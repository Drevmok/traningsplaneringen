import { UI } from '../data/blockMeta'
import { seedTemplates } from '../data/seedTemplates'
import type { ClubSnapshot, ClubTemplate } from '../lib/clubTemplates'
import type { SavedTemplate } from '../lib/savedTemplates'
import { ClubTemplatesSection } from './ClubTemplates'

interface Props {
  club: ClubSnapshot
  savedTemplates: SavedTemplate[]
  onPickBuiltIn: (templateId: string) => void
  onPickSaved: (id: string) => void
  onPickClub: (template: ClubTemplate) => void
  /** Använd mall sheet only (Slice 47): Kopiera delningskod / Ta bort and the hint under Mina mallar. */
  onCopySaved?: (id: string) => void
  onDeleteSaved?: (id: string) => void
}

/** Slice 46 B1: one mall list for the Använd mall sheet (Slice 47) and the Mall step of Planera pass. */
export function MallList({ club, savedTemplates, onPickBuiltIn, onPickSaved, onPickClub, onCopySaved, onDeleteSaved }: Props) {
  const tools = Boolean(onCopySaved && onDeleteSaved)
  return (
    <>
      <ClubTemplatesSection club={club} onPick={onPickClub} />
      {savedTemplates.length > 0 && (
        <>
          <h3 className="template-group">{UI.myTemplates}</h3>
          <ul className="template-list">
            {savedTemplates.map((template) => (
              <li key={template.id} className="template-saved">
                <button type="button" className="template-card" onClick={() => onPickSaved(template.id)}>
                  <strong>{template.title}</strong>
                  <span className="template-meta">{template.totalMinutes} min</span>
                </button>
                {tools && (
                  <div className="template-saved-actions">
                    <button type="button" className="btn-text" onClick={() => onCopySaved?.(template.id)}>
                      {UI.copyTemplateCode}
                    </button>
                    <button
                      type="button"
                      className="btn-text"
                      aria-label={`${UI.deleteTemplate} ${template.title}`}
                      onClick={() => onDeleteSaved?.(template.id)}
                    >
                      {UI.deleteTemplate}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {tools && <p className="muted template-saved-hint">{UI.savedTemplatesHint}</p>}
      <ul className="template-list">
        {seedTemplates.map((t) => (
          <li key={t.id}>
            <button type="button" className="template-card" onClick={() => onPickBuiltIn(t.id)}>
              <strong>{t.title}</strong>
              <span>{t.description}</span>
              <span className="template-meta">~{t.totalMinutes} min · Trygg för nya tränare</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
