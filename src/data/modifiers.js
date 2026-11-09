/** Modifier catalogs by menu category — attached to dishes at seed time. */

const doneness = {
  id: 'doneness',
  name: 'Doneness',
  required: true,
  multi: false,
  options: [
    { id: 'rare', name: 'Rare', price: 0 },
    { id: 'medium-rare', name: 'Medium rare', price: 0 },
    { id: 'medium', name: 'Medium', price: 0 },
    { id: 'well', name: 'Well done', price: 0 },
  ],
}

const sauce = {
  id: 'sauce',
  name: 'Sauce',
  required: false,
  multi: false,
  options: [
    { id: 'none', name: 'No sauce', price: 0 },
    { id: 'pepper', name: 'Peppercorn', price: 3 },
    { id: 'bearnaise', name: 'Béarnaise', price: 4 },
    { id: 'red-wine', name: 'Red wine jus', price: 3 },
  ],
}

const landExtras = {
  id: 'land-extras',
  name: 'Add-ons',
  required: false,
  multi: true,
  options: [
    { id: 'foie', name: 'Foie gras', price: 18 },
    { id: 'truffle', name: 'Black truffle', price: 22 },
    { id: 'bone-marrow', name: 'Bone marrow', price: 12 },
  ],
}

const seaPrep = {
  id: 'sea-prep',
  name: 'Preparation',
  required: true,
  multi: false,
  options: [
    { id: 'grilled', name: 'Grilled', price: 0 },
    { id: 'butter', name: 'Meunière', price: 2 },
    { id: 'crudo', name: 'Crudo style', price: 0 },
  ],
}

const seaExtras = {
  id: 'sea-extras',
  name: 'Add-ons',
  required: false,
  multi: true,
  options: [
    { id: 'caviar', name: 'Oscietra caviar', price: 28 },
    { id: 'lobster-butter', name: 'Lobster butter', price: 8 },
    { id: 'lemon-butter', name: 'Brown butter', price: 3 },
  ],
}

const drinkSize = {
  id: 'size',
  name: 'Size',
  required: true,
  multi: false,
  options: [
    { id: 'glass', name: 'Glass', price: 0 },
    { id: 'carafe', name: 'Carafe', price: 18 },
    { id: 'bottle', name: 'Bottle', price: 42 },
  ],
}

const drinkExtras = {
  id: 'drink-extras',
  name: 'Preferences',
  required: false,
  multi: true,
  options: [
    { id: 'no-ice', name: 'No ice', price: 0 },
    { id: 'extra-citrus', name: 'Extra citrus', price: 1 },
  ],
}

const sweetExtras = {
  id: 'sweet-extras',
  name: 'Finish',
  required: false,
  multi: true,
  options: [
    { id: 'candle', name: 'Birthday candle', price: 0 },
    { id: 'extra-cream', name: 'Extra cream', price: 3 },
    { id: 'ice-cream', name: 'Scoop of ice cream', price: 6 },
  ],
}

const gardenExtras = {
  id: 'garden-extras',
  name: 'Extras',
  required: false,
  multi: true,
  options: [
    { id: 'egg', name: 'Soft egg', price: 4 },
    { id: 'cheese', name: 'Aged cheese', price: 5 },
    { id: 'nuts-off', name: 'No nuts', price: 0 },
  ],
}

const sidesExtras = {
  id: 'sides-extras',
  name: 'Extras',
  required: false,
  multi: true,
  options: [
    { id: 'garlic', name: 'Roasted garlic', price: 2 },
    { id: 'herbs', name: 'Fresh herbs', price: 1 },
  ],
}

const beginningsExtras = {
  id: 'starter-extras',
  name: 'Extras',
  required: false,
  multi: true,
  options: [
    { id: 'bread', name: 'Extra bread', price: 4 },
    { id: 'butter', name: 'Cultured butter', price: 3 },
  ],
}

const byCategory = {
  land: [doneness, sauce, landExtras],
  sea: [seaPrep, seaExtras],
  drinks: [drinkSize, drinkExtras],
  sweet: [sweetExtras],
  garden: [gardenExtras],
  sides: [sidesExtras],
  beginnings: [beginningsExtras],
}

export function modifierGroupsForCategory(categoryId) {
  return byCategory[categoryId] ?? []
}

export function modifiersKey(modifiers = []) {
  return [...modifiers]
    .map((m) => `${m.groupId}:${m.optionId}`)
    .sort()
    .join('|')
}

export function lineUnitPrice(item) {
  if (item.basePrice != null) {
    const mods = (item.modifiers ?? []).reduce((s, m) => s + (Number(m.price) || 0), 0)
    return Number(item.basePrice) + mods
  }
  return Number(item.price) || 0
}

export function formatModifiers(modifiers = []) {
  if (!modifiers.length) return ''
  return modifiers.map((m) => m.name).join(' · ')
}

export function defaultSelections(groups = []) {
  const selected = {}
  groups.forEach((g) => {
    if (g.required && !g.multi && g.options[0]) {
      selected[g.id] = g.options[0].id
    } else if (g.multi) {
      selected[g.id] = []
    } else {
      selected[g.id] = g.options.find((o) => o.price === 0)?.id ?? g.options[0]?.id ?? null
    }
  })
  return selected
}

export function selectionsToModifiers(groups, selected) {
  const out = []
  groups.forEach((g) => {
    const val = selected[g.id]
    if (g.multi) {
      ;(val ?? []).forEach((optId) => {
        const opt = g.options.find((o) => o.id === optId)
        if (opt) out.push({ groupId: g.id, groupName: g.name, optionId: opt.id, name: opt.name, price: opt.price })
      })
    } else if (val) {
      const opt = g.options.find((o) => o.id === val)
      if (opt && !(opt.id === 'none' && opt.price === 0 && g.id === 'sauce')) {
        out.push({ groupId: g.id, groupName: g.name, optionId: opt.id, name: opt.name, price: opt.price })
      } else if (opt && g.required) {
        out.push({ groupId: g.id, groupName: g.name, optionId: opt.id, name: opt.name, price: opt.price })
      }
    }
  })
  return out
}

export function validateSelections(groups, selected) {
  for (const g of groups) {
    if (!g.required) continue
    if (g.multi) {
      if (!(selected[g.id]?.length > 0)) return `Choose ${g.name}`
    } else if (!selected[g.id]) {
      return `Choose ${g.name}`
    }
  }
  return null
}
