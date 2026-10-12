/** Slice 35 — «Tyck till»: the static mailto (RFC 6068: encodeURIComponent, CRLF line breaks). */
import { SLICE_NUMBER, UI } from '../data/blockMeta'

export const FEEDBACK_TO = 'drevmok@gmail.com'

export const feedbackBody = () => [...UI.feedbackMailBodyLines, '', UI.feedbackMailVersion.replace('{n}', SLICE_NUMBER)].join('\r\n')

export const feedbackHref = () =>
  `mailto:${FEEDBACK_TO}?subject=${encodeURIComponent(UI.feedbackMailSubject)}&body=${encodeURIComponent(feedbackBody())}`
