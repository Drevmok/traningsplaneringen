// Slice 51 (A1): the one start path for smokes. Startsidan has only «Planera pass» since Slice 46;
// «Tomt pass» and «Starta från mall» live in the guide (HomeWizard). Selectors: features/home-kom-igang.md
// (Stabila väljare) — role + visible Swedish label first.
//   startTomt(p, { hall, minutes })      → «Planera pass» → «Tomt pass» → Hall → Passlängd → .builder
//   openMallList(p, { hall })            → «Planera pass» → «Starta från mall» → Hall → returns .home-wizard-malls
//   startMall(p, namn = 'Nybörjare', { hall, minutes }) → «Planera pass» → «Starta från mall» → Hall → mallkort → Passlängd (Slice 55) → «Använd mall» if asked → .builder
// Defaults = what the old start-page «Tomt pass» gave (createBlankSession: forening-bla «Gymmix – Stora hallen», 60 min).
export const DEFAULT_HALL = 'Gymmix – Stora hallen'
export const DEFAULT_MINUTES = 60

const sheet = (p) => p.locator('.home-wizard-sheet')

async function openWizard(p) {
  await p.locator('.home').waitFor()
  await p.locator('.home').getByRole('button', { name: 'Planera pass', exact: true }).click()
  await sheet(p).waitFor()
}

async function chip(p, label) {
  await sheet(p).getByRole('option', { name: label, exact: true }).click()
}

export async function startTomt(p, { hall = DEFAULT_HALL, minutes = DEFAULT_MINUTES } = {}) {
  await openWizard(p)
  await sheet(p).getByRole('button', { name: 'Tomt pass', exact: true }).click()
  await chip(p, hall)
  await chip(p, `${minutes} min`)
  await p.locator('.builder').waitFor()
  await p.waitForTimeout(250)
}

/** «Planera pass» → «Starta från mall» → Hall; returns the guide's mall list (built-in, saved and club cards). */
export async function openMallList(p, { hall = DEFAULT_HALL } = {}) {
  await openWizard(p)
  await sheet(p).getByRole('button', { name: 'Starta från mall', exact: true }).click()
  await chip(p, hall)
  const list = sheet(p).locator('.home-wizard-malls')
  await list.waitFor()
  return list
}

/** Slice 55 B1: after a mall card in the guide, Passlängd follows. No-op where there is no length step (Mallar sheet, main before 55). */
export async function pickLength(p, minutes = DEFAULT_MINUTES) {
  await p.waitForTimeout(350)
  const o = sheet(p).getByRole('option', { name: `${minutes} min`, exact: true })
  if (await o.count()) { await o.click(); await p.waitForTimeout(400) }
}

export async function startMall(p, namn = 'Nybörjare', { hall = DEFAULT_HALL, minutes = DEFAULT_MINUTES } = {}) {
  await openMallList(p, { hall })
  const re = namn instanceof RegExp ? namn : new RegExp(namn)
  await sheet(p).locator('.home-wizard-malls .template-card').filter({ hasText: re }).first().click()
  await p.waitForTimeout(400)
  // Slice 55 B1: the mall path ends with Passlängd (absent on main before 55).
  await pickLength(p, minutes)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true })
  if (await c.count()) await c.click()
  await p.locator('.builder').waitFor()
  await p.waitForTimeout(250)
}

// Slice 51 (A1): the question path (Slice 46+): one tap per answer, no «Nästa»/«Skapa pass».
//   Ålder → Fokus → Hall → Passlängd → .builder
export { openWizard, chip as wizardOption, sheet as wizardSheet }
export async function startFragor(p, { age = /7–9/, focus = /^Trampett/, hall = DEFAULT_HALL, minutes = DEFAULT_MINUTES } = {}) {
  await openWizard(p)
  for (const o of [age, focus, hall, `${minutes} min`]) {
    await sheet(p).getByRole('option', { name: o, exact: typeof o === 'string' }).first().click()
    await p.waitForTimeout(150)
  }
  await p.locator('.builder').waitFor()
  await p.waitForTimeout(250)
}
