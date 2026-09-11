/**
 * Contextual toolbelt definitions.
 *
 * Items are either:
 *   { tool }   — sets the active instrument (used to resolve a target action)
 *   { action } — fires immediately
 *   { wire }   — arms a conductor for termination
 */

export const TOOL_HINTS = {
  hands: 'Operate, grip and assemble by hand',
  tester: 'Non-contact voltage tester — prove it before you trust it',
  screwdriver: 'Cover plates, device screws and terminals',
  stripper: 'Prepare conductor ends to gauge length',
  lock: 'Lockout/tagout device — secure the disconnect',
  wrench: 'Finish slip-joint nuts a quarter turn past hand-tight',
}

const WIRES = [
  { id: 'black_line', label: 'Hot feed', note: 'black', swatch: '#1b1b1b' },
  { id: 'black_load', label: 'Switch leg', note: 'black', swatch: '#2b2b2b' },
  { id: 'white_neutral', label: 'Neutral', note: 'white', swatch: '#eaeaea' },
  { id: 'bare_ground', label: 'Ground', note: 'bare', swatch: '#c98b52' },
]

export function getGroups(scenarioId, f = {}) {
  if (scenarioId === 'electrical-switch') {
    const groups = [
      {
        id: 'ppe',
        label: 'PPE',
        items: [
          { id: 'glasses', label: 'Safety glasses', icon: 'glasses', action: 'equip:glasses', done: !!f.ppe_glasses },
          { id: 'gloves', label: 'Insul. gloves', icon: 'gloves', action: 'equip:gloves', done: !!f.ppe_gloves },
        ],
      },
      {
        id: 'tools',
        label: 'Instrument',
        items: [
          { id: 'hands', label: 'Hands', icon: 'hands', tool: 'hands' },
          { id: 'tester', label: 'Volt tester', icon: 'tester', tool: 'tester' },
          { id: 'screwdriver', label: 'Screwdriver', icon: 'screwdriver', tool: 'screwdriver' },
          { id: 'stripper', label: 'Stripper', icon: 'stripper', tool: 'stripper' },
          { id: 'lock', label: 'Lock / tag', icon: 'lock', tool: 'lock' },
        ],
      },
    ]

    if (f.switch_out) {
      groups.push({
        id: 'wire',
        label: 'Conductor — select, then click a terminal',
        items: WIRES.map((w) => ({
          ...w,
          icon: 'bolt',
          wire: w.id,
          done: (f.wires || {})[w.id] !== undefined,
          note2: (f.stripped || []).includes(w.id) ? 'stripped' : 'not stripped',
          swatch: w.swatch,
        })),
      })
    }
    return groups
  }

  if (scenarioId === 'plumbing-ptrap') {
    return [
      {
        id: 'ppe',
        label: 'PPE',
        items: [
          { id: 'glasses', label: 'Eye protect', icon: 'glasses', action: 'equip:glasses', done: !!f.ppe_glasses },
          { id: 'gloves', label: 'Gloves', icon: 'gloves', action: 'equip:gloves', done: !!f.ppe_gloves },
        ],
      },
      {
        id: 'tools',
        label: 'Instrument',
        items: [
          { id: 'hands', label: 'Hands', icon: 'hands', tool: 'hands' },
          { id: 'wrench', label: 'Wrench', icon: 'wrench', tool: 'wrench' },
        ],
      },
    ]
  }
  return []
}
