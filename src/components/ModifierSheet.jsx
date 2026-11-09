import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Modal, Button } from './dashboard/ui'
import {
  defaultSelections,
  lineUnitPrice,
  selectionsToModifiers,
  validateSelections,
} from '../data/modifiers'

export default function ModifierSheet({ open, item, onClose, onConfirm }) {
  const groups = item?.modifierGroups ?? []
  const [selected, setSelected] = useState({})
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !item) return
    setSelected(defaultSelections(groups))
    setQty(1)
    setNotes('')
    setError('')
  }, [open, item?.id])

  const modifiers = useMemo(() => selectionsToModifiers(groups, selected), [groups, selected])
  const unit = item
    ? lineUnitPrice({ basePrice: item.price, modifiers })
    : 0

  const toggleMulti = (groupId, optionId) => {
    setSelected((prev) => {
      const cur = prev[groupId] ?? []
      const next = cur.includes(optionId) ? cur.filter((id) => id !== optionId) : [...cur, optionId]
      return { ...prev, [groupId]: next }
    })
  }

  const confirm = () => {
    const err = validateSelections(groups, selected)
    if (err) {
      setError(err)
      return
    }
    onConfirm?.({
      menuId: item.id,
      name: item.name,
      basePrice: item.price,
      price: unit,
      qty,
      notes: notes.trim(),
      modifiers,
      image: item.image,
      lineKey: `${item.id}::${modifiers.map((m) => `${m.groupId}:${m.optionId}`).sort().join('|')}`,
    })
    onClose?.()
  }

  return (
    <Modal
      open={open && Boolean(item)}
      onClose={onClose}
      title={item?.name ?? 'Customize'}
      description={item ? `From $${item.price} · choose options` : ''}
      size="md"
      footer={
        <div className="flex w-full items-center gap-3">
          <div className="dash-chip flex items-center rounded-lg">
            <button type="button" className="dash-icon-btn p-2" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-8 text-center text-sm tabular-nums">{qty}</span>
            <button type="button" className="dash-icon-btn p-2" onClick={() => setQty((q) => q + 1)} aria-label="Increase">
              <Plus className="size-3.5" />
            </button>
          </div>
          <Button className="flex-1" onClick={confirm}>
            Add · ${unit * qty}
          </Button>
        </div>
      }
    >
      {item ? (
        <div className="space-y-5">
          {item.description ? <p className="text-sm dash-muted">{item.description}</p> : null}

          {groups.map((g) => (
            <div key={g.id}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium">{g.name}</p>
                <span className="text-[11px] dash-subtle">{g.required ? 'Required' : 'Optional'}{g.multi ? ' · multi' : ''}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.options.map((opt) => {
                  const active = g.multi
                    ? (selected[g.id] ?? []).includes(opt.id)
                    : selected[g.id] === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        g.multi
                          ? toggleMulti(g.id, opt.id)
                          : setSelected((prev) => ({ ...prev, [g.id]: opt.id }))
                      }
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                        active ? 'border-transparent font-medium' : ''
                      }`}
                      style={
                        active
                          ? { background: 'var(--dash-accent)', color: 'var(--dash-accent-ink)' }
                          : { borderColor: 'var(--dash-border)', background: 'var(--dash-surface-soft)' }
                      }
                    >
                      <span className="block">{opt.name}</span>
                      {opt.price > 0 ? (
                        <span className={`text-[11px] ${active ? 'opacity-80' : 'dash-muted'}`}>+${opt.price}</span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div>
            <p className="mb-1.5 text-xs font-medium dash-muted">Item note</p>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, preferences…"
              className="dash-input h-10 w-full rounded-lg border-0 px-3 text-sm outline-none"
            />
          </div>

          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
        </div>
      ) : null}
    </Modal>
  )
}
