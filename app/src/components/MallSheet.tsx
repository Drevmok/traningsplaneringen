import { UI } from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import { useClubTemplates, type ClubTemplate } from '../lib/clubTemplates'
import type { SavedTemplate } from '../lib/savedTemplates'
import { MallList } from './MallList'

interface Props {
  savedTemplates: SavedTemplate[]
  onPickBuiltIn: (templateId: string) => void
  onPickSaved: (id: string) => void
  onPickClub: (template: ClubTemplate) => void
  onCopySaved: (id: string) => void
  onDeleteSaved: (id: string) => void
  onClose: () => void
}

/** Slice 47 A1: «Använd mall» in Passbyggaren — its own sheet with the mall list and the Mina mallar tools (no admin tools). */
export function MallSheet({ onClose, ...list }: Props) {
  useBodyScrollLock(true)
  const club = useClubTemplates()
  return (
    <div
      className="modal-backdrop mall-sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mall-sheet-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div className="modal mall-sheet">
        <div className="mall-sheet-head">
          <h2 id="mall-sheet-title">{UI.useTemplate}</h2>
          <button type="button" className="btn-secondary sheet-close" onClick={onClose} autoFocus>
            {UI.close}
          </button>
        </div>
        <MallList club={club} {...list} />
      </div>
    </div>
  )
}
