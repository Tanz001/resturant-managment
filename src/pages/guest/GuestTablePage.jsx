import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Ban,
  CakeSlice,
  Check,
  CheckCircle2,
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
  Users,
  Wheat,
} from 'lucide-react'
import { menuCategories } from '../../data/content'
import { formatModifiers } from '../../data/modifiers'
import { useRestaurant } from '../../store/RestaurantProvider'
import {
  Button,
  Field,
  FilterSelect,
  Input,
  Modal,
  Textarea,
  useToast,
} from '../../components/dashboard/ui'
import ModifierSheet from '../../components/ModifierSheet'

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

export default function GuestTablePage() {
  const { tableId } = useParams()
  const { state, actions } = useRestaurant()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { toast, ToastView } = useToast()

  const table = state.tables.find((t) => String(t.id) === String(tableId))
  const [guests, setGuests] = useState(2)
  const [customerName, setCustomerName] = useState('')
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [basket, setBasket] = useState([])
  const [orderNotes, setOrderNotes] = useState('')
  const [noteFor, setNoteFor] = useState(null)
  const [basketOpen, setBasketOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [customize, setCustomize] = useState(null)

  const menu = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.menu.filter((m) => {
      if (!m.available) return false
      if (category !== 'all' && m.categoryId !== category) return false
      if (q && !m.name.toLowerCase().includes(q) && !m.description?.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [state.menu, category, query])

  const qtyOf = (id) => basket.filter((b) => b.menuId === id).reduce((s, b) => s + b.qty, 0)
  const total = basket.reduce((s, b) => s + b.price * b.qty, 0)
  const count = basket.reduce((s, b) => s + b.qty, 0)

  const pushLine = (line) => {
    setBasket((prev) => {
      const key = line.lineKey ?? line.menuId
      const ex = prev.find((b) => (b.lineKey ?? b.menuId) === key)
      if (ex) {
        return prev.map((b) =>
          (b.lineKey ?? b.menuId) === key ? { ...b, qty: b.qty + line.qty } : b,
        )
      }
      return [...prev, line]
    })
    setJustAdded(line.menuId)
    setTimeout(() => setJustAdded(null), 500)
  }

  const add = (m) => {
    if (!m.available) return
    if (m.modifierGroups?.length) {
      setCustomize(m)
      return
    }
    pushLine({
      menuId: m.id,
      name: m.name,
      basePrice: m.price,
      price: m.price,
      qty: 1,
      notes: '',
      modifiers: [],
      image: m.image,
      lineKey: m.id,
    })
  }
  const dec = (key) =>
    setBasket((prev) =>
      prev
        .map((b) => ((b.lineKey ?? b.menuId) === key ? { ...b, qty: b.qty - 1 } : b))
        .filter((b) => b.qty > 0),
    )
  const remove = (key) => setBasket((prev) => prev.filter((b) => (b.lineKey ?? b.menuId) !== key))

  const send = () => {
    if (!table) return
    if (!customerName.trim()) return toast('Please enter your name')
    if (!basket.length) return toast('Add at least one dish')
    setSubmitting(true)
    const nextId = String(state.nextOrderId)
    actions.createOrder({
      table: String(table.id),
      guests,
      customerName: customerName.trim(),
      waiterId: 'guest-qr',
      waiterName: 'QR Guest',
      items: basket.map(({ image: _image, lineKey: _lk, ...b }) => b),
      notes: orderNotes.trim(),
      source: 'qr',
      paymentStatus: 'unpaid',
    })
    try {
      sessionStorage.setItem(
        `mn-guest-order-${nextId}`,
        JSON.stringify({ orderId: nextId, tableId: table.id, name: customerName.trim() }),
      )
    } catch {
      /* ignore */
    }
    toast('Order sent to the kitchen', 'success')
    setBasket([])
    setBasketOpen(false)
    setTimeout(() => {
      navigate(`/t/${table.id}/order/${nextId}`)
    }, 350)
  }

  if (!table) {
    return <Navigate to="/menu" replace />
  }

  return (
    <div className="dashboard-app min-h-dvh" data-theme="light">
      <ToastView />

      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{ background: 'rgba(250,250,247,0.92)', borderColor: 'var(--dash-border)' }}
      >
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
          <div>
            <p className="font-[family-name:var(--font-dash-serif)] text-lg leading-none tracking-tight">
              {state.settings.name}
            </p>
            <p className="mt-1 text-[11px] tracking-[0.16em] text-[#245a4f] uppercase">
              Table {table.id} · Scan & order
            </p>
          </div>
          <Link to="/menu" className="text-xs dash-muted hover:text-[#141816]">
            Full menu
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 pb-32">
        {/* Guest details */}
        <section className="dash-card mb-5 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Field label="Your name">
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="So we can bring your order"
                autoComplete="name"
              />
            </Field>
            <div>
              <p className="mb-1.5 text-xs font-medium dash-muted">Guests</p>
              <div className="dash-chip flex h-10 items-center rounded-lg">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="dash-icon-btn rounded-l-lg p-1.5"
                  aria-label="Fewer guests"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="flex w-10 items-center justify-center gap-1 text-sm font-medium tabular-nums">
                  <Users className="size-3.5 opacity-60" />
                  {guests}
                </span>
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(12, g + 1))}
                  className="dash-icon-btn rounded-r-lg p-1.5"
                  aria-label="More guests"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs dash-muted">
            Order from your phone — the kitchen gets it instantly. Pay at the table when ready.
          </p>
        </section>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="relative min-w-[160px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 dash-subtle" strokeWidth={1.75} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes…"
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
            minWidth="12rem"
          />
        </div>

        {/* Menu grid */}
        <motion.div layout className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {menu.map((m) => {
              const q = qtyOf(m.id)
              return (
                <motion.article
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: reduce ? 0.01 : 0.25, ease }}
                  className="dash-card overflow-hidden"
                  style={q ? { boxShadow: '0 0 0 2px var(--dash-accent)' } : undefined}
                >
                  <button
                    type="button"
                    onClick={() => add(m)}
                    className="relative aspect-[16/10] w-full overflow-hidden"
                    style={{ background: 'var(--dash-input)' }}
                  >
                    {m.image ? (
                      <img src={m.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                    <AnimatePresence>
                      {justAdded === m.id ? (
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1.2, opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-[#245a4f]/75 text-white"
                        >
                          <Check className="size-8" strokeWidth={3} />
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                    {m.tag ? (
                      <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium tracking-wide text-[#245a4f] uppercase">
                        {m.tag}
                      </span>
                    ) : null}
                  </button>
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium leading-tight">{m.name}</h3>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">${m.price}</p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 dash-muted">{m.description}</p>
                    <div className="mt-3 flex items-center justify-end">
                      {q ? (
                        <div className="dash-btn-primary flex items-center rounded-lg">
                          <button type="button" onClick={() => dec(m.id)} className="p-1.5" aria-label="Remove one">
                            <Minus className="size-3.5" strokeWidth={2.5} />
                          </button>
                          <motion.span key={q} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-5 text-center text-sm font-semibold tabular-nums">
                            {q}
                          </motion.span>
                          <button type="button" onClick={() => add(m)} className="p-1.5" aria-label="Add one">
                            <Plus className="size-3.5" strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => add(m)}>
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

        {menu.length === 0 ? (
          <div className="dash-card mt-4 flex flex-col items-center py-12 text-center">
            <Ban className="mb-2 size-6 dash-subtle" />
            <p className="text-sm font-medium">No dishes match</p>
            <p className="mt-1 text-xs dash-muted">Try another category or clear search.</p>
          </div>
        ) : null}
      </main>

      {/* Sticky basket bar */}
      <AnimatePresence>
        {count > 0 ? (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.28, ease }}
            className="fixed inset-x-0 bottom-0 z-40 px-4 pb-5"
          >
            <button
              type="button"
              onClick={() => setBasketOpen(true)}
              className="dash-btn-primary mx-auto flex w-full max-w-3xl items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold shadow-2xl"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="size-4" />
                <motion.span key={count} initial={{ scale: 0.85 }} animate={{ scale: 1 }}>
                  {count} item{count === 1 ? '' : 's'}
                </motion.span>
              </span>
              <span className="tabular-nums">Review · ${total}</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Modal open={basketOpen} onClose={() => setBasketOpen(false)} title="Your order" size="md" description={`Table ${table.id}`}>
        <div className="space-y-4">
          <div className="rounded-xl p-3 text-sm" style={{ background: 'var(--dash-surface-soft)' }}>
            <p className="font-medium">{customerName.trim() || 'Name required'}</p>
            <p className="text-xs dash-muted">
              Table {table.id} · {guests} guests
            </p>
          </div>

          <ul className="space-y-2">
            {basket.map((b) => {
              const key = b.lineKey ?? b.menuId
              return (
              <li
                key={key}
                className="flex items-start gap-3 rounded-xl p-2"
                style={{ background: 'var(--dash-surface-soft)' }}
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-lg" style={{ background: 'var(--dash-input)' }}>
                  {b.image ? <img src={b.image} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="truncate text-sm font-medium">{b.name}</p>
                    <p className="shrink-0 text-sm tabular-nums">${b.price * b.qty}</p>
                  </div>
                  {b.modifiers?.length ? (
                    <p className="text-[11px] dash-muted">{formatModifiers(b.modifiers)}</p>
                  ) : null}
                  {b.notes ? <p className="text-[11px] dash-accent-text">“{b.notes}”</p> : null}
                  <div className="mt-1.5 flex items-center gap-1">
                    <div className="dash-chip flex items-center rounded-md">
                      <button type="button" onClick={() => dec(key)} className="dash-icon-btn p-1">
                        <Minus className="size-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-semibold tabular-nums">{b.qty}</span>
                      <button type="button" onClick={() => pushLine({ ...b, qty: 1 })} className="dash-icon-btn p-1">
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <button type="button" onClick={() => setNoteFor(b)} className="dash-icon-btn rounded-md p-1" aria-label="Note">
                      <StickyNote className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => remove(key)} className="dash-icon-btn ml-auto rounded-md p-1" aria-label="Remove">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
              )
            })}
          </ul>

          <Input
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Note for the kitchen (allergies, timing…)"
          />

          <div className="space-y-1 border-t pt-3 text-sm" style={{ borderColor: 'var(--dash-border)' }}>
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

          <Button
            size="lg"
            className="w-full"
            disabled={!customerName.trim() || basket.length === 0 || submitting}
            onClick={send}
          >
            <Send className="size-4" /> Send to kitchen
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] dash-subtle">
            <CheckCircle2 className="size-3.5" /> Payment at the table when your meal is done
          </p>
        </div>
      </Modal>

      <Modal
        open={Boolean(noteFor)}
        onClose={() => setNoteFor(null)}
        title={noteFor ? `Note for ${noteFor.name}` : ''}
        size="sm"
        footer={<Button onClick={() => setNoteFor(null)}>Done</Button>}
      >
        {noteFor ? (
          <Field label="Special request">
            <Textarea
              rows={3}
              autoFocus
              value={
                basket.find((b) => (b.lineKey ?? b.menuId) === (noteFor.lineKey ?? noteFor.menuId))
                  ?.notes ?? ''
              }
              onChange={(e) =>
                setBasket((prev) =>
                  prev.map((b) =>
                    (b.lineKey ?? b.menuId) === (noteFor.lineKey ?? noteFor.menuId)
                      ? { ...b, notes: e.target.value }
                      : b,
                  ),
                )
              }
            />
          </Field>
        ) : null}
      </Modal>

      <ModifierSheet
        open={Boolean(customize)}
        item={customize}
        onClose={() => setCustomize(null)}
        onConfirm={pushLine}
      />
    </div>
  )
}
