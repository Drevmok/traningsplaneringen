import { BLOCK_LABELS, mismatchMessage, UI } from '../data/blockMeta'
import type { MismatchWarning } from '../types'

interface Props {
  warning: MismatchWarning
  onDismiss: () => void
}

export function MismatchBanner({ warning, onDismiss }: Props) {
  const label = BLOCK_LABELS[warning.intendedBlockType]
  return (
    <div className="mismatch-banner" role="status">
      <span>{mismatchMessage(label)}</span>
      <button type="button" className="btn-text" onClick={onDismiss}>
        {UI.dismiss}
      </button>
    </div>
  )
}
