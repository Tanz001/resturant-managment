import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Ban,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Fish,
  Grape,
  LayoutGrid,
  Leaf,
  List,
  Pencil,
  Plus,
  Salad,
  Search,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  Wheat,
  CakeSlice,
  Layers,
} from 'lucide-react'
import { menuCategories } from '../../data/content'
import { useRestaurant, useDerived } from '../../store/RestaurantProvider'
import {
  Button,
  Dropdown,
  EmptyState,
  Field,
  FilterSelect,
  ImagePicker,
  Input,
  Modal,
  NativeSelect,
  Textarea,
  useToast,
} from '../../components/dashboard/ui'

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

const blank = {
  name: '',
  categoryId: menuCategories[0].id,
  price: '',
  description: '',
  tag: '',
  image: '',
  available: true,
}

export default function MenuManagerPage() {
  const { state, actions } = useRestaurant()
  const { soldMap } = useDerived()
  const { toast, ToastView } = useToast()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [availability, setAvailability] = useState('all')
  const [view, setView] = useState('table')
  const [editing, setEditing] = useState(null) // null | 'new' | item
  const [form, setForm] = useState(blank)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.menu.filter((m) => {
      if (category !== 'all' && m.categoryId !== category) return false
      if (availability === 'available' && !m.available) return false
      if (availability === 'soldout' && m.available) return false
      if (q && !m.name.toLowerCase().includes(q) && !m.description?.toLowerCase().includes(q)) return false
      return true
    })
  }, [state.menu, query, category, availability])

  const openNew = () => {
    setForm(blank)
    setEditing('new')
  }
  const openEdit = (item) => {
    setForm({ ...item, price: String(item.price) })
    setEditing(item)
  }
  const close = () => setEditing(null)

  const save = () => {
    const price = Number(form.price)
    if (!form.name.trim() || Number.isNaN(price) || price <= 0) {
      toast('Add a name and a valid price')
      return
    }
    const payload = { ...form, name: form.name.trim(), price }
    if (editing === 'new') {
      actions.addMenuItem(payload)
      toast(`${payload.name} added to menu`, 'success')
    } else {
      actions.updateMenuItem(editing.id, payload)
      toast(`${payload.name} updated`, 'success')
    }
    close()
  }

  const duplicate = (item) => {
    const { id: _id, ...rest } = item
    actions.addMenuItem({ ...rest, name: `${item.name} (copy)` })
    toast('Dish duplicated')
  }

  const counts = useMemo(() => {
    const c = { all: state.menu.length }
    menuCategories.forEach((cat) => {
      c[cat.id] = state.menu.filter((m) => m.categoryId === cat.id).length
    })
    return c
  }, [state.menu])

  const available = state.menu.filter((m) => m.available).length
  const soldOut = state.menu.length - available
  const soldTonight = Object.values(soldMap).reduce((s, n) => s + n, 0)
  const topSellerId = Object.entries(soldMap).sort((a, b) => b[1] - a[1])[0]?.[0]
  const topSeller = state.menu.find((m) => m.id === topSellerId)

  const categoryOptions = [
    { value: 'all', label: 'All categories', icon: Layers, count: counts.all },
    ...menuCategories.map((cat) => ({
      value: cat.id,
      label: cat.name,
      icon: categoryIcons[cat.id] ?? Salad,
      count: counts[cat.id] ?? 0,
    })),
  ]
  const availabilityOptions = [
    { value: 'all', label: 'Any status', icon: Layers, count: counts.all },
    { value: 'available', label: 'On menu', icon: CheckCircle2, count: available },
    { value: 'soldout', label: 'Sold out', icon: Ban, count: soldOut },
  ]

  return (
    <div className="space-y-5">
      <ToastView />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MenuStatCard
          label="Total dishes"
          value={state.menu.length}
          hint={`${menuCategories.length} categories`}
          icon={UtensilsCrossed}
        />
        <MenuStatCard
          label="On menu tonight"
          value={available}
          hint={`${soldOut} marked sold out`}
          icon={CheckCircle2}
          tone="ok"
        />
        <MenuStatCard
          label="Sold tonight"
          value={soldTonight}
          hint="Across all dishes"
          icon={Sparkles}
          tone="accent"
        />
        <MenuStatCard
          label="Top seller"
          value={topSeller ? soldMap[topSeller.id] : 0}
          hint={topSeller?.name ?? 'No sales yet'}
          icon={CakeSlice}
        />
      </div>

      <div className="dash-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <label className="relative min-w-[180px] flex-1 sm:max-w-xs">
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
            options={categoryOptions}
            minWidth="13rem"
          />
          <FilterSelect
            label="Availability"
            icon={CheckCircle2}
            value={availability}
            onChange={setAvailability}
            options={availabilityOptions}
            minWidth="11rem"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="dash-chip flex rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setView('table')}
              aria-label="Table view"
              className={`rounded-lg p-2 ${view === 'table' ? 'dash-btn-primary' : 'dash-icon-btn'}`}
            >
              <List className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Grid view"
              className={`rounded-lg p-2 ${view === 'grid' ? 'dash-btn-primary' : 'dash-icon-btn'}`}
            >
              <LayoutGrid className="size-4" strokeWidth={1.75} />
            </button>
          </div>
          <Button onClick={openNew}>
            <Plus className="size-4" strokeWidth={2} /> Add dish
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No dishes match"
          description="Try another category or search, or add a new dish."
          action={<Button onClick={openNew}>Add dish</Button>}
        />
      ) : view === 'table' ? (
        <div className="dash-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead style={{ background: 'var(--dash-surface-soft)' }}>
                <tr className="border-b text-xs dash-muted" style={{ borderColor: 'var(--dash-border)' }}>
                  <th className="px-4 py-3 font-medium md:px-5">Dish</th>
                  <th className="px-4 py-3 font-medium md:px-5">Category</th>
                  <th className="px-4 py-3 font-medium md:px-5">Price</th>
                  <th className="px-4 py-3 font-medium md:px-5">Sold today</th>
                  <th className="px-4 py-3 font-medium md:px-5">Status</th>
                  <th className="px-4 py-3 text-right font-medium md:px-5" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.tr
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="dash-row-hover border-b"
                      style={{ borderColor: 'var(--dash-border-soft)' }}
                    >
                      <td className="px-4 py-3 md:px-5">
                        <div className="flex items-center gap-3">
                          <DishThumb item={item} />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.name}</p>
                            <p className="truncate text-xs dash-muted">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 dash-soft md:px-5">
                        {menuCategories.find((c) => c.id === item.categoryId)?.name ?? item.categoryId}
                      </td>
                      <td className="px-4 py-3 tabular-nums md:px-5">${item.price}</td>
                      <td className="px-4 py-3 tabular-nums md:px-5">{soldMap[item.id] ?? 0}</td>
                      <td className="px-4 py-3 md:px-5">
                        <button
                          type="button"
                          onClick={() => actions.updateMenuItem(item.id, { available: !item.available })}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                            item.available ? 'dash-badge-emerald' : 'dash-badge-rose'
                          }`}
                        >
                          {item.available ? 'On menu' : 'Sold out'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right md:px-5">
                        <DishMenu
                          item={item}
                          onEdit={() => openEdit(item)}
                          onToggle={() => actions.updateMenuItem(item.id, { available: !item.available })}
                          onDuplicate={() => duplicate(item)}
                          onDelete={() => setConfirmDelete(item)}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="dash-card group overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden" style={{ background: 'var(--dash-input)' }}>
                  {item.image ? (
                    <img src={item.image} alt="" className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${item.available ? '' : 'grayscale'}`} />
                  ) : null}
                  <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] ${item.available ? 'dash-badge-emerald' : 'dash-badge-rose'}`}>
                    {item.available ? 'On menu' : 'Sold out'}
                  </span>
                  <div className="absolute top-2 right-2 rounded-lg" style={{ background: 'var(--dash-surface)' }}>
                    <DishMenu
                      item={item}
                      onEdit={() => openEdit(item)}
                      onToggle={() => actions.updateMenuItem(item.id, { available: !item.available })}
                      onDuplicate={() => duplicate(item)}
                      onDelete={() => setConfirmDelete(item)}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-tight">{item.name}</p>
                    <p className="shrink-0 text-sm tabular-nums">${item.price}</p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs dash-muted">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] dash-subtle">
                    <span>{menuCategories.find((c) => c.id === item.categoryId)?.name}</span>
                    <span>{soldMap[item.id] ?? 0} sold today</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add / edit modal */}
      <Modal
        open={editing !== null}
        onClose={close}
        title={editing === 'new' ? 'Add dish' : 'Edit dish'}
        description="Photo, pricing and availability shown to waiters and guests."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button onClick={save}>{editing === 'new' ? 'Add to menu' : 'Save changes'}</Button>
          </>
        }
      >
        <div className="space-y-5">
          <ImagePicker value={form.image} onChange={(image) => setForm((f) => ({ ...f, image }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Dish name">
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Charred ribeye" />
            </Field>
            <Field label="Price (USD)">
              <Input type="number" min="0" step="1" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="68" />
            </Field>
            <Field label="Category">
              <NativeSelect value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
                {menuCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Tag" hint="Shown as a small label, e.g. Signature, Vegetarian">
              <Input value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} placeholder="Signature" />
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Bone marrow jus, smoked shallot, black garlic ash." />
          </Field>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} className="size-4 accent-[#245a4f]" />
            Available tonight
          </label>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Remove dish?"
        description={`“${confirmDelete?.name}” will be removed from the menu. Past orders keep their history.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                actions.removeMenuItem(confirmDelete.id)
                toast('Dish removed')
                setConfirmDelete(null)
              }}
            >
              Remove
            </Button>
          </>
        }
      />
    </div>
  )
}

function MenuStatCard({ label, value, hint, icon: Icon, tone = 'default' }) {
  const toneClass =
    tone === 'accent' ? 'dash-accent-text' : tone === 'ok' ? 'text-emerald-400' : ''
  return (
    <article className="dash-card p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs tracking-wide dash-muted">{label}</p>
          <p className={`mt-2 font-[family-name:var(--font-dash-serif)] text-3xl tracking-tight tabular-nums ${toneClass}`}>
            {value}
          </p>
          <p className="mt-2 truncate text-[11px] dash-subtle">{hint}</p>
        </div>
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'var(--dash-accent-soft)', color: 'var(--dash-accent-text)' }}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
      </div>
    </article>
  )
}

function DishThumb({ item }) {
  return (
    <div className="size-11 shrink-0 overflow-hidden rounded-lg" style={{ background: 'var(--dash-input)' }}>
      {item.image ? (
        <img src={item.image} alt="" className={`h-full w-full object-cover ${item.available ? '' : 'grayscale'}`} loading="lazy" />
      ) : null}
    </div>
  )
}

function DishMenu({ item, onEdit, onToggle, onDuplicate, onDelete }) {
  return (
    <Dropdown
      items={[
        { label: 'Edit dish', icon: Pencil, onClick: onEdit },
        {
          label: item.available ? 'Mark sold out' : 'Put back on menu',
          icon: item.available ? EyeOff : Eye,
          onClick: onToggle,
        },
        { label: 'Duplicate', icon: Copy, onClick: onDuplicate },
        'divider',
        { label: 'Remove', icon: Trash2, onClick: onDelete, danger: true },
      ]}
    />
  )
}
