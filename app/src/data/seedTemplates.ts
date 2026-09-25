import type { SessionBlock, SessionItem, SessionTemplate } from '../types'
import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from './blockMeta'

function item(
  activityId: string,
  durationMinutes: number,
  order: number,
): SessionItem {
  return {
    id: `tmpl-item-${activityId}-${order}`,
    activityId,
    durationMinutes,
    note: '',
    order,
  }
}

function block(
  type: SessionBlock['type'],
  items: SessionItem[],
): SessionBlock {
  return {
    id: `tmpl-block-${type}`,
    type,
    title: BLOCK_LABELS[type],
    durationMinutes: BLOCK_BUDGETS[type],
    items,
    coachNote: '',
  }
}

/** ~55 min item sum — new-coach-safe Slice 03 ids only */
const beginnerBlocks: SessionBlock[] = [
  block('gathering', [
    item('gather-valkomstcheck-in', 5, 0),
    item('gather-dagens-teknik', 3, 1),
  ]),
  block('warmup', [item('warm-hall-varv', 10, 0)]),
  block('techniques', [
    item('tech-ljushopp-satsbrada', 6, 0),
    item('tech-handstaende-falla-rygg', 6, 1),
    item('tech-falla-bakat-hojd', 6, 2),
  ]),
  block('strength', [
    item('strength-styrkelatar', 5, 0),
    item('strength-burpee-emom', 8, 1),
  ]),
  block('fun_and_games', [item('fun-rundpingis-medicinboll', 6, 0)]),
]

/** ~45 min item sum — new-coach-safe Slice 03 ids only */
const shortBlocks: SessionBlock[] = [
  block('gathering', [item('gather-valkomstcheck-in', 5, 0)]),
  block('warmup', [
    item('warm-uppvarmningsdans', 6, 0),
    item('warm-tojning-coach', 5, 1),
  ]),
  block('techniques', [
    item('tech-ljushopp-satsbrada', 6, 0),
    item('tech-handstaende-falla-rygg', 6, 1),
  ]),
  block('strength', [item('strength-burpee-emom', 8, 0)]),
  block('fun_and_games', [
    item('fun-handstaende-utmaning', 5, 0),
    item('fun-123-forflyttning', 4, 1),
  ]),
]

function sumItems(blocks: SessionBlock[]): number {
  return blocks.reduce(
    (acc, b) => acc + b.items.reduce((s, i) => s + i.durationMinutes, 0),
    0,
  )
}

export const seedTemplates: SessionTemplate[] = [
  {
    id: 'tmpl-beginner-60',
    title: 'Nybörjare — ca 55 min',
    description:
      'Trygg start för nya tränare: samling, uppvärmning, enkla tekniker, styrka och lek.',
    targetLevel: 'new_coach_safe',
    totalMinutes: sumItems(beginnerBlocks),
    blocks: beginnerBlocks,
  },
  {
    id: 'tmpl-short-45',
    title: 'Kort pass — ca 45 min',
    description:
      'Kompakt pass när tiden är knapp. Fortfarande alla fem blocken.',
    targetLevel: 'beginner',
    totalMinutes: sumItems(shortBlocks),
    blocks: shortBlocks,
  },
]

export function orderedTemplateBlocks(
  template: SessionTemplate,
): SessionBlock[] {
  return BLOCK_ORDER.map((type) => {
    const found = template.blocks.find((b) => b.type === type)
    if (found) return found
    return block(type, [])
  })
}
