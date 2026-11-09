import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Ban,
  Check,
  CheckCircle2,
  CakeSlice,
  Fish,
  Grape,
  Layers,
  Leaf,
  Minus,
  Plus,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  StickyNote,
  Trash2,
  UtensilsCrossed,
  Wheat,
} from 'lucide-react'
import { menuCategories } from '../../data/content'
import { useDerived, useRestaurant } from '../../store/RestaurantProvider'
import { Button, Field, FilterSelect, Input, Modal, Textarea, useToast } from '../../components/dashboard/ui'

const categoryIcons = {
  all: Layers,
  beginnings: Sparkles,
  garden: Leaf,
  sea: Fish,
  land: UtensilsCrossed,
  sides: Wheat,
  sweet: CakeSlice,
  drinks: Grape,
}

const ease = [0.22, 1, 0.36, 1]

export default function TakeOrderPage() {
  const { state, actions } = useRestaurant()
  const { tableStatus } = useDerived()
  const { waiter } = useOutletContext()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { toast, ToastView } = useToast()

  const [table, setTable] = useState(null)
  const [guests, setGuests] = useState(2)
  const [customerName, setCustomerName] = useState('')
  const [category, setCategory] = useState('all')
  const [availability, setAvailability] = useState('all')
  const [query, setQuery] = useState('')
  const [basket, setBasket] = useState([]) // {menuId, name, price, qty, notes}
  const [orderNotes, setOrderNotes] = useState('')
  const [noteFor, setNoteFor] = useState(null)
  const [basketOpen, setBasketOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(null)

  const menu = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.menu.filter((m) => {
      if (category !== 'all' && m.categoryId !== category) return false
      if (availability === 'available' && !m.available) return false
      if (availability === 'soldout' && m.available) return false
      if (q && !m.name.toLowerCase().includes(q) && !m.description?.toLowerCase().includes(q)) return false
      return true
    })
  }, [state.menu, category, availability, query])

  const qtyOf = (id) => basket.find((b) => b.menuId === id)?.qty ?? 0
  const total = basket.reduce((s, b) => s + b.price * b.qty, 0)
  const count = basket.reduce((s, b) => s + b.qty, 0)

  const add = (m) => {
    if (!m.available) return
    setBasket((prev) => {
      const ex = prev.find((b) => b.menuId === m.id)
      if (ex) return prev.map((b) => (b.menuId === m.id ? { ...b, qty: b.qty + 1 } : b))
      return [...prev, { menuId: m.id, name: m.name, price: m.price, qty: 1, notes: '', image: m.image }]
    })
    setJustAdded(m.id)
    setTimeout(() => setJustAdded(null), 600)
  }
  const dec = (id) =>
    setBasket((prev) => prev.map((b) => (b.menuId === id ? { ...b, qty: b.qty - 1 } : b)).filter((b) => b.qty > 0))
  const remove = (id) => setBasket((prev) => prev.filter((b) => b.menuId !== id))

  const send = () => {
    if (!table) return toast('Pick a table first')
    if (!customerName.trim()) return toast('Enter the customer name')
    if (!basket.length) return toast('Add at least one item')
    if (!waiter) return toast('Select a waiter from the top-right menu')
    actions.createOrder({
      table,
      guests,
      customerName: customerName.trim(),
      waiterId: waiter.id,
      waiterName: waiter.name.split(' ')[0],
      items: basket.map(({ image: _image, ...b }) => b),
      notes: orderNotes.trim(),
    })
    toast(`Order sent · ${customerName.trim()} · Table ${table}`, 'success')
    setBasket([])
    setOrderNotes('')
    setCustomerName('')
    setBasketOpen(false)
    setTimeout(() => navigate('/waiter/orders'), 500)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <ToastView />

      <div className="space-y-5">
        {/* Step 1: table + guest */}
        <section className="dash-card p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-sm font-medium">
              <Step n={1} /> Table & guest
            </h2>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[180px] flex-1 sm:flex-none">
                <Field label="Customer name">
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Guest name"
                    autoComplete="name"
                  />
                </Field>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium dash-muted">Guests</p>
                <div className="dash-chip flex h-10 items-center rounded-lg">
                  <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="dash-icon-btn rounded-l-lg p-1.5" aria-label="Fewer guests">
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium tabular-nums" style={{ color: 'var(--dash-text)' }}>
                    {guests}
                  </span>
                  <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} className="dash-icon-btn rounded-r-lg p-1.5" aria-label="More guests">
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
            {state.tables.map((t) => {
              const status = tableStatus[t.id]
              const active = table === t.id
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTable(t.id)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                    active ? 'dash-btn-primary' : status === 'occupied' ? 'dash-badge-gold' : status === 'reserved' ? 'dash-badge-sky' : 'dash-chip'
                  }`}
                  title={`Table ${t.id} · ${t.seats} seats · ${status}`}
                >
                  <span className="font-semibold tabular-nums">{t.id}</span>
                  <span className="text-[10px] opacity-70">{t.seats}p</span>
                  {active ? (
                    <motion.span layoutId="table-check" className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-white text-[#245a4f]">
                      <Check className="size-3" strokeWidth={3} />
                    </motion.span>
                  ) : null}
                </motion.button>
              )
            })}
          </div>
          <p className="mt-3 text-[11px] dash-subtle">
            <span className="dash-badge-gold rounded px-1">gold</span> occupied — adds a second ticket to the same table ·{' '}
            <span className="dash-badge-sky rounded px-1">blue</span> reserved
          </p>
        </section>

        {/* Step 2: menu */}
        <section className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-sm font-medium">
              <Step n={2} /> Select items
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-[160px] flex-1 sm:flex-none sm:w-56">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 dash-subtle" strokeWidth={1.75} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search menu…"
                  className="dash-input h-10 w-full rounded-xl border-0 pr-3 pl-9 text-sm"
                />
              </label>
              <FilterSelect
                label="Category"
                icon={Layers}
                value={category}
                onChange={setCategory}
                options={[
                  { value: 'all', label: 'All categories', icon: Layers },
                  ...menuCategories.map((c) => ({
                    value: c.id,
                    label: c.name,
                    icon: categoryIcons[c.id] ?? Layers,
                  })),
                ]}
                minWidth="12.5rem"
              />
              <FilterSelect
                label="Availability"
                icon={CheckCircle2}
                value={availability}
                onChange={setAvailability}
                options={[
                  { value: 'all', label: 'Any status', icon: Layers },
                  { value: 'available', label: 'Available', icon: CheckCircle2 },
                  { value: 'soldout', label: 'Sold out', icon: Ban },
                ]}
                minWidth="10.5rem"
              />
            </div>
          </div>

          <motion.div layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {menu.map((m) => {
                const q = qtyOf(m.id)
                return (
                  <motion.article
                    key={m.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: reduce ? 0.01 : 0.25, ease }}
                    className={`dash-card relative flex gap-3 p-3 ${m.available ? '' : 'opacity-55'} ${q ? 'ring-2' : ''}`}
                    style={q ? { outlineColor: 'var(--dash-accent)', boxShadow: '0 0 0 2px var(--dash-accent)' } : undefined}
                  >
                    <button type="button" onClick={() => add(m)} disabled={!m.available} className="relative size-20 shrink-0 overflow-hidden rounded-xl" style={{ background: 'var(--dash-input)' }}>
                      {m.image ? <img src={m.image} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
                      <AnimatePresence>
                        {justAdded === m.id ? (
                          <motion.span
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.3, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-[#245a4f]/80 text-white"
                          >
                            <Check className="size-7" strokeWidth={3} />
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium leading-tight">{m.name}</p>
                        <p className="shrink-0 text-sm tabular-nums">${m.price}</p>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs dash-muted">{m.description}</p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        {m.available ? (
                          m.tag ? <span className="dash-badge-neutral rounded-full px-2 py-0.5 text-[10px]">{m.tag}</span> : <span />
                        ) : (
                          <span className="dash-badge-rose rounded-full px-2 py-0.5 text-[10px]">Sold out</span>
                        )}
                        {q ? (
                          <div className="dash-btn-primary flex items-center rounded-lg">
                            <button type="button" onClick={() => dec(m.id)} className="p-1.5" aria-label="Remove one">
                              <Minus className="size-3.5" strokeWidth={2.5} />
                            </button>
                            <motion.span key={q} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="w-5 text-center text-sm font-semibold tabular-nums">
                              {q}
                            </motion.span>
                            <button type="button" onClick={() => add(m)} className="p-1.5" aria-label="Add one">
                              <Plus className="size-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" disabled={!m.available} onClick={() => add(m)}>
                            <Plus className="size-3.5" strokeWidth={2.5} /> Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </section>
      </div>

      {/* Basket (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <Basket
            table={table}
            guests={guests}
            customerName={customerName}
            basket={basket}
            total={total}
            count={count}
            orderNotes={orderNotes}
            setOrderNotes={setOrderNotes}
            onDec={dec}
            onInc={(id) => add(state.menu.find((m) => m.id === id))}
            onRemove={remove}
            onNote={(b) => setNoteFor(b)}
            onSend={send}
            waiter={waiter}
          />
        </div>
      </aside>

      {/* Basket bar (mobile) */}
      <AnimatePresence>
        {count > 0 ? (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.3, ease }}
            className="fixed inset-x-4 bottom-20 z-40 lg:hidden"
          >
            <button type="button" onClick={() => setBasketOpen(true)} className="dash-btn-primary flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-sm font-medium shadow-2xl">
              <span className="flex items-center gap-2">
                <ShoppingBag className="size-4" />
                <motion.span key={count} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  {count} item{count === 1 ? '' : 's'}
                </motion.span>
                {table ? <span className="opacity-80">· Table {table}</span> : null}
              </span>
              <span className="tabular-nums">${total}</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Modal open={basketOpen} onClose={() => setBasketOpen(false)} title="Your ticket" size="md">
        <Basket
          table={table}
          guests={guests}
          customerName={customerName}
          basket={basket}
          total={total}
          count={count}
          orderNotes={orderNotes}
          setOrderNotes={setOrderNotes}
          onDec={dec}
          onInc={(id) => add(state.menu.find((m) => m.id === id))}
          onRemove={remove}
          onNote={(b) => setNoteFor(b)}
          onSend={send}
          waiter={waiter}
          bare
        />
      </Modal>

      <Modal
        open={Boolean(noteFor)}
        onClose={() => setNoteFor(null)}
        title={noteFor ? `Note for ${noteFor.name}` : ''}
        size="sm"
        footer={
          <Button onClick={() => setNoteFor(null)}>Done</Button>
        }
      >
        {noteFor ? (
          <Field label="Kitchen instruction" hint="e.g. medium-rare, no nuts, sauce on the side">
            <Textarea
              rows={3}
              autoFocus
              value={basket.find((b) => b.menuId === noteFor.menuId)?.notes ?? ''}
              onChange={(e) => setBasket((prev) => prev.map((b) => (b.menuId === noteFor.menuId ? { ...b, notes: e.target.value } : b)))}
            />
          </Field>
        ) : null}
      </Modal>
    </div>
  )
}

function Step({ n }) {
  return (
    <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full text-[11px] font-semibold" style={{ background: 'var(--dash-accent)', color: 'var(--dash-accent-ink)' }}>
      {n}
    </span>
  )
}

function Basket({ table, guests, customerName, basket, total, count, orderNotes, setOrderNotes, onDec, onInc, onRemove, onNote, onSend, waiter, bare = false }) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{table ? `Table ${table}` : 'No table selected'}</p>
          <p className="text-xs dash-muted">
            {customerName?.trim() || 'Guest name pending'} · {guests} guests · {waiter?.name?.split(' ')[0] ?? 'Waiter'}
          </p>
        </div>
        <span className="dash-chip rounded-full px-2.5 py-1 text-xs tabular-nums">{count} items</span>
      </div>

      <div className="mt-4 min-h-[120px]">
        {basket.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed text-center text-xs dash-muted" style={{ borderColor: 'var(--dash-border)' }}>
            <ShoppingBag className="mb-2 size-5 opacity-60" strokeWidth={1.5} />
            Tap dishes to add them here
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {basket.map((b) => (
                <motion.li
                  key={b.menuId}
                  layout
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12, height: 0 }}
                  className="flex items-start gap-3 rounded-xl p-2"
                  style={{ background: 'var(--dash-surface-soft)' }}
                >
                  <div className="size-11 shrink-0 overflow-hidden rounded-lg" style={{ background: 'var(--dash-input)' }}>
                    {b.image ? <img src={b.image} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium">{b.name}</p>
                      <p className="shrink-0 text-sm tabular-nums">${b.price * b.qty}</p>
                    </div>
                    {b.notes ? <p className="truncate text-[11px] dash-accent-text">“{b.notes}”</p> : null}
                    <div className="mt-1.5 flex items-center gap-1">
                      <div className="dash-chip flex items-center rounded-md">
                        <button type="button" onClick={() => onDec(b.menuId)} className="dash-icon-btn rounded-l-md p-1" aria-label="Remove one">
                          <Minus className="size-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-semibold tabular-nums">{b.qty}</span>
                        <button type="button" onClick={() => onInc(b.menuId)} className="dash-icon-btn rounded-r-md p-1" aria-label="Add one">
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <button type="button" onClick={() => onNote(b)} className="dash-icon-btn rounded-md p-1" aria-label="Add note">
                        <StickyNote className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => onRemove(b.menuId)} className="dash-icon-btn ml-auto rounded-md p-1" aria-label="Remove">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <div className="mt-4">
        <Input value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Note for kitchen (allergies, timing…)" />
      </div>

      <div className="mt-4 space-y-1 border-t pt-3 text-sm" style={{ borderColor: 'var(--dash-border)' }}>
        <div className="flex justify-between dash-muted">
          <span>Subtotal</span>
          <span className="tabular-nums">${total}</span>
        </div>
        <div className="flex justify-between dash-muted">
          <span>Service 12.5%</span>
          <span className="tabular-nums">${Math.round(total * 0.125)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">${Math.round(total * 1.125)}</span>
        </div>
      </div>

      <Button size="lg" className="mt-4 w-full" disabled={!table || !customerName?.trim() || basket.length === 0} onClick={onSend}>
        <Send className="size-4" strokeWidth={2} /> Send to kitchen
      </Button>
    </>
  )
  if (bare) return content
  return <div className="dash-card p-4 md:p-5">{content}</div>
}
