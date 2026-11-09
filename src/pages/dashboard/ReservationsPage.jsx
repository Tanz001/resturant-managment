import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Armchair, CheckCircle2, Pencil, Plus, Trash2, XCircle, Phone } from 'lucide-react'
import { reservationStatusStyles } from '../../data/dashboard'
import { useDerived, useRestaurant } from '../../store/RestaurantProvider'
import { Button, Dropdown, EmptyState, Field, Input, Modal, NativeSelect, Textarea, useToast } from '../../components/dashboard/ui'

const blank = { name: '', guests: '2', date: 'Tonight', time: '19:30', phone: '', notes: '', table: '', status: 'pending' }

export default function ReservationsPage() {
  const { state, actions } = useRestaurant()
  const { tableStatus } = useDerived()
  const { toast, ToastView } = useToast()
  const [status, setStatus] = useState('all')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)

  const rows = useMemo(() => {
    const list = status === 'all' ? state.reservations : state.reservations.filter((r) => r.status === status)
    return [...list].sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date === 'Tonight' ? -1 : 1))
  }, [state.reservations, status])

  const openNew = () => {
    setForm(blank)
    setEditing('new')
  }
  const openEdit = (r) => {
    setForm({ ...blank, ...r, guests: String(r.guests) })
    setEditing(r)
  }
  const close = () => setEditing(null)
  const save = () => {
    if (!form.name.trim()) return toast('Add a guest name')
    const payload = { ...form, name: form.name.trim(), guests: Number(form.guests) || 1 }
    if (editing === 'new') {
      actions.addReservation(payload)
      toast('Reservation added', 'success')
    } else {
      actions.updateReservation(editing.id, payload)
      toast('Reservation updated', 'success')
    }
    close()
  }

  const counts = useMemo(() => {
    const c = { all: state.reservations.length }
    ;['pending', 'confirmed', 'seated', 'cancelled'].forEach((s) => {
      c[s] = state.reservations.filter((r) => r.status === s).length
    })
    return c
  }, [state.reservations])

  const freeTables = state.tables.filter((t) => tableStatus[t.id] === 'free')

  return (
    <div className="space-y-5">
      <ToastView />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm dash-muted">
          {counts.all} bookings · <span className="dash-accent-text">{counts.pending} awaiting confirmation</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {['all', 'pending', 'confirmed', 'seated', 'cancelled'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1.5 text-[11px] tracking-wide capitalize ${status === s ? 'dash-chip-active' : 'dash-chip hover:opacity-80'}`}
              >
                {s} <span className="ml-1 opacity-60">{counts[s]}</span>
              </button>
            ))}
          </div>
          <Button onClick={openNew}>
            <Plus className="size-4" strokeWidth={2} /> New booking
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No reservations" description="New bookings from the website and phone appear here." action={<Button onClick={openNew}>New booking</Button>} />
      ) : (
        <motion.div layout className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {rows.map((r) => {
              const st = reservationStatusStyles[r.status]
              return (
                <motion.article
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="dash-card p-4 md:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">{r.name}</h3>
                      <p className="mt-1 text-xs dash-muted">
                        {r.date} · {r.time} · {r.guests} guests{r.table ? ` · Table ${r.table}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${st.className}`}>{st.label}</span>
                      <Dropdown
                        items={[
                          { label: 'Edit booking', icon: Pencil, onClick: () => openEdit(r) },
                          r.status === 'pending' ? { label: 'Confirm', icon: CheckCircle2, onClick: () => actions.updateReservation(r.id, { status: 'confirmed' }) } : null,
                          r.status !== 'seated' && r.status !== 'cancelled' ? { label: 'Seat guests', icon: Armchair, onClick: () => actions.updateReservation(r.id, { status: 'seated' }) } : null,
                          r.phone ? { label: 'Call guest', icon: Phone, onClick: () => window.open(`tel:${r.phone}`) } : null,
                          'divider',
                          r.status !== 'cancelled' ? { label: 'Cancel booking', icon: XCircle, danger: true, onClick: () => actions.updateReservation(r.id, { status: 'cancelled' }) } : null,
                          { label: 'Delete', icon: Trash2, danger: true, onClick: () => actions.removeReservation(r.id) },
                        ].filter(Boolean)}
                      />
                    </div>
                  </div>

                  {r.notes ? <p className="mt-3 text-xs dash-muted">“{r.notes}”</p> : null}

                  <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3" style={{ borderColor: 'var(--dash-border)' }}>
                    <p className="text-xs dash-subtle">{r.phone ?? '—'}</p>
                    <div className="flex gap-2">
                      {r.status === 'pending' ? (
                        <Button size="sm" variant="accent" onClick={() => actions.updateReservation(r.id, { status: 'confirmed' })}>
                          Confirm
                        </Button>
                      ) : null}
                      {r.status === 'confirmed' ? (
                        <Button size="sm" onClick={() => actions.updateReservation(r.id, { status: 'seated' })}>
                          Seat
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal
        open={editing !== null}
        onClose={close}
        title={editing === 'new' ? 'New booking' : 'Edit booking'}
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button onClick={save}>{editing === 'new' ? 'Add booking' : 'Save'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Guest name">
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Clara Dupont" />
            </Field>
          </div>
          <Field label="Guests">
            <Input type="number" min="1" max="20" value={form.guests} onChange={(e) => setForm((f) => ({ ...f, guests: e.target.value }))} />
          </Field>
          <Field label="Time">
            <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
          </Field>
          <Field label="Day">
            <NativeSelect value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}>
              <option>Tonight</option>
              <option>Tomorrow</option>
              <option>This week</option>
            </NativeSelect>
          </Field>
          <Field label="Table" hint={`${freeTables.length} free right now`}>
            <NativeSelect value={form.table} onChange={(e) => setForm((f) => ({ ...f, table: e.target.value }))}>
              <option value="">Assign later</option>
              {state.tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.id} · {t.seats} seats {tableStatus[t.id] !== 'free' ? `(${tableStatus[t.id]})` : ''}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+33 6 …" />
          </Field>
          <Field label="Status">
            <NativeSelect value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {Object.entries(reservationStatusStyles).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Allergies, occasion, seating preference…" />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  )
}
