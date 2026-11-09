import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import { fullMenu, menuCategories } from '../data/content'
import { reservations as seedReservations, staff as seedStaffBase, tables as seedTables } from '../data/dashboard'

const STORAGE_KEY = 'maison-noir-store-v4'
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

/* ---------- seed helpers ---------- */

const categoryImages = {
  beginnings: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=600&q=70',
  garden: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=70',
  sea: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=600&q=70',
  land: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=70',
  sides: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=70',
  sweet: 'https://images.unsplash.com/photo-1600891964092-4316c14cddb0?auto=format&fit=crop&w=600&q=70',
  drinks: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=70',
}

const staffAvatars = {
  s1: 'https://i.pravatar.cc/160?img=47',
  s2: 'https://i.pravatar.cc/160?img=12',
  s3: 'https://i.pravatar.cc/160?img=32',
  s4: 'https://i.pravatar.cc/160?img=59',
  s5: 'https://i.pravatar.cc/160?img=68',
  s6: 'https://i.pravatar.cc/160?img=5',
}

// Deterministic pseudo-random so the demo looks the same on every reload
function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedMenu() {
  return fullMenu.map((item, i) => ({
    id: item.id,
    name: item.name,
    categoryId: item.categoryId,
    description: item.description,
    price: Number(item.price),
    tag: item.tag ?? '',
    image: item.image ?? categoryImages[item.categoryId],
    available: !(i % 11 === 7),
  }))
}

function seedStaff() {
  return seedStaffBase.map((s) => ({
    ...s,
    avatar: staffAvatars[s.id],
    email: `${s.name.split(' ')[0].toLowerCase()}@maisonnoir.example`,
    phone: '+33 6 00 00 00 00',
    active: true,
  }))
}

const demoGuests = [
  'Clara Dupont',
  'Marcus Chen',
  'Elena Rossi',
  'James Okonkwo',
  'Priya Shah',
  'Thomas Berg',
  'Amara Singh',
  'Jonah Weiss',
  'Ines Carvalho',
  'Théo Lambert',
]

function seedOrders(menu, staff) {
  const rand = mulberry32(42)
  const waiters = staff.filter((s) => s.role === 'Waiter')
  const available = menu.filter((m) => m.available)
  const now = Date.now()
  const orders = []
  let seq = 1000

  const pick = () => available[Math.floor(rand() * available.length)]
  const guestName = () => demoGuests[Math.floor(rand() * demoGuests.length)]
  const mkItems = (n) => {
    const items = []
    for (let i = 0; i < n; i += 1) {
      const m = pick()
      const existing = items.find((x) => x.menuId === m.id)
      if (existing) existing.qty += 1
      else items.push({ menuId: m.id, name: m.name, price: m.price, qty: 1, notes: '' })
    }
    return items
  }

  // Historical (last 6 days) — all served
  for (let d = 6; d >= 1; d -= 1) {
    const count = 10 + Math.floor(rand() * 9)
    for (let i = 0; i < count; i += 1) {
      const w = waiters[Math.floor(rand() * waiters.length)]
      const created = now - d * DAY - (2 + rand() * 5) * HOUR
      seq += 1
      orders.push({
        id: String(seq),
        table: String(1 + Math.floor(rand() * 12)),
        guests: 1 + Math.floor(rand() * 5),
        customerName: guestName(),
        waiterId: w.id,
        waiterName: w.name.split(' ')[0],
        items: mkItems(2 + Math.floor(rand() * 5)),
        status: 'served',
        createdAt: created,
        updatedAt: created + 50 * 60 * 1000,
        notes: '',
      })
    }
  }

  // Today earlier — served
  for (let i = 0; i < 9; i += 1) {
    const w = waiters[Math.floor(rand() * waiters.length)]
    const created = now - (1.2 + rand() * 3) * HOUR
    seq += 1
    orders.push({
      id: String(seq),
      table: String(1 + Math.floor(rand() * 12)),
      guests: 1 + Math.floor(rand() * 5),
      customerName: guestName(),
      waiterId: w.id,
      waiterName: w.name.split(' ')[0],
      items: mkItems(2 + Math.floor(rand() * 5)),
      status: 'served',
      createdAt: created,
      updatedAt: created + 45 * 60 * 1000,
      notes: '',
    })
  }

  // Live now
  const live = [
    { table: '4', status: 'preparing', mins: 12, n: 3, notes: 'No nuts on table 4', guest: 'Clara Dupont' },
    { table: '8', status: 'new', mins: 2, n: 2, notes: '', guest: 'Marcus Chen' },
    { table: '12', status: 'ready', mins: 24, n: 5, notes: 'Birthday — candle on dessert', guest: 'Elena Rossi' },
    { table: '2', status: 'preparing', mins: 9, n: 4, notes: '', guest: 'Priya Shah' },
    { table: '7', status: 'preparing', mins: 31, n: 1, notes: 'Guest in a hurry', guest: 'James Okonkwo' },
    { table: '11', status: 'served', mins: 48, n: 6, notes: '', guest: 'Thomas Berg' },
  ]
  live.forEach((l, i) => {
    const w = waiters[i % waiters.length]
    seq += 1
    const created = now - l.mins * 60 * 1000
    orders.push({
      id: String(seq),
      table: l.table,
      guests: Math.max(1, l.n - 1),
      customerName: l.guest,
      waiterId: w.id,
      waiterName: w.name.split(' ')[0],
      items: mkItems(l.n),
      status: l.status,
      createdAt: created,
      updatedAt: created,
      notes: l.notes,
    })
  })

  return { orders, nextOrderId: seq + 1 }
}

function buildSeed() {
  const menu = seedMenu()
  const staff = seedStaff()
  const { orders, nextOrderId } = seedOrders(menu, staff)
  return {
    version: 4,
    menu,
    staff,
    orders,
    nextOrderId,
    reservations: seedReservations.map((r) => ({ ...r, phone: '+33 6 12 34 56 78' })),
    tables: seedTables.map((t) => ({ id: t.id, seats: t.seats })),
    settings: {
      name: 'Maison Noir',
      address: '18 Rue des Ombres, 75006 Paris',
      hours: 'Tue–Sat · 18:00–23:00',
      currency: 'USD',
      currencySymbol: '$',
    },
  }
}

function loadState() {
  if (typeof window === 'undefined') return buildSeed()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildSeed()
    const parsed = JSON.parse(raw)
    if (parsed?.version !== 4) return buildSeed()
    return parsed
  } catch {
    return buildSeed()
  }
}

/* ---------- reducer ---------- */

const uid = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function reducer(state, action) {
  switch (action.type) {
    case 'reset':
      return buildSeed()

    /* menu */
    case 'menu/add':
      return { ...state, menu: [{ id: uid('dish'), available: true, ...action.item }, ...state.menu] }
    case 'menu/update':
      return {
        ...state,
        menu: state.menu.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)),
      }
    case 'menu/remove':
      return { ...state, menu: state.menu.filter((m) => m.id !== action.id) }

    /* staff */
    case 'staff/add':
      return { ...state, staff: [...state.staff, { id: uid('s'), active: true, status: 'off', ...action.member }] }
    case 'staff/update':
      return {
        ...state,
        staff: state.staff.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)),
      }
    case 'staff/remove':
      return { ...state, staff: state.staff.filter((s) => s.id !== action.id) }

    /* orders */
    case 'orders/create': {
      const id = String(state.nextOrderId)
      const now = Date.now()
      const order = {
        id,
        status: 'new',
        createdAt: now,
        updatedAt: now,
        notes: '',
        guests: 2,
        ...action.order,
      }
      return { ...state, orders: [...state.orders, order], nextOrderId: state.nextOrderId + 1 }
    }
    case 'orders/status':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.id ? { ...o, status: action.status, updatedAt: Date.now() } : o,
        ),
      }
    case 'orders/update':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.id ? { ...o, ...action.patch, updatedAt: Date.now() } : o,
        ),
      }
    case 'orders/remove':
      return { ...state, orders: state.orders.filter((o) => o.id !== action.id) }

    /* reservations */
    case 'reservations/add':
      return {
        ...state,
        reservations: [{ id: uid('r'), status: 'pending', notes: '', ...action.reservation }, ...state.reservations],
      }
    case 'reservations/update':
      return {
        ...state,
        reservations: state.reservations.map((r) =>
          r.id === action.id ? { ...r, ...action.patch } : r,
        ),
      }
    case 'reservations/remove':
      return { ...state, reservations: state.reservations.filter((r) => r.id !== action.id) }

    /* settings */
    case 'settings/update':
      return { ...state, settings: { ...state.settings, ...action.patch } }

    default:
      return state
  }
}

/* ---------- context ---------- */

const RestaurantContext = createContext(null)

export function RestaurantProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota errors in demo */
    }
  }, [state])

  const actions = useMemo(
    () => ({
      reset: () => dispatch({ type: 'reset' }),
      addMenuItem: (item) => dispatch({ type: 'menu/add', item }),
      updateMenuItem: (id, patch) => dispatch({ type: 'menu/update', id, patch }),
      removeMenuItem: (id) => dispatch({ type: 'menu/remove', id }),
      addStaff: (member) => dispatch({ type: 'staff/add', member }),
      updateStaff: (id, patch) => dispatch({ type: 'staff/update', id, patch }),
      removeStaff: (id) => dispatch({ type: 'staff/remove', id }),
      createOrder: (order) => dispatch({ type: 'orders/create', order }),
      setOrderStatus: (id, status) => dispatch({ type: 'orders/status', id, status }),
      updateOrder: (id, patch) => dispatch({ type: 'orders/update', id, patch }),
      removeOrder: (id) => dispatch({ type: 'orders/remove', id }),
      addReservation: (reservation) => dispatch({ type: 'reservations/add', reservation }),
      updateReservation: (id, patch) => dispatch({ type: 'reservations/update', id, patch }),
      removeReservation: (id) => dispatch({ type: 'reservations/remove', id }),
      updateSettings: (patch) => dispatch({ type: 'settings/update', patch }),
    }),
    [],
  )

  const value = useMemo(() => ({ state, actions }), [state, actions])

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext)
  if (!ctx) throw new Error('useRestaurant must be used inside RestaurantProvider')
  return ctx
}

/* ---------- derived helpers ---------- */

export const OPEN_STATUSES = ['new', 'preparing', 'ready']
export const LATE_AFTER_MIN = 20

export function orderTotal(order) {
  return order.items.reduce((sum, it) => sum + it.price * it.qty, 0)
}

export function orderItemCount(order) {
  return order.items.reduce((sum, it) => sum + it.qty, 0)
}

export function isLate(order, now = Date.now()) {
  return (
    (order.status === 'new' || order.status === 'preparing') &&
    now - order.createdAt > LATE_AFTER_MIN * 60 * 1000
  )
}

export function effectiveStatus(order, now = Date.now()) {
  return isLate(order, now) ? 'late' : order.status
}

export function minutesAgo(ts, now = Date.now()) {
  return Math.max(0, Math.round((now - ts) / 60000))
}

export function startOfDay(ts = Date.now()) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function categoryName(categoryId) {
  return menuCategories.find((c) => c.id === categoryId)?.name ?? categoryId
}

export function useDerived() {
  const { state } = useRestaurant()
  return useMemo(() => {
    const now = Date.now()
    const today = startOfDay(now)
    const orders = state.orders
    const todayOrders = orders.filter((o) => o.createdAt >= today && o.status !== 'cancelled')
    const yesterdayOrders = orders.filter(
      (o) => o.createdAt >= today - DAY && o.createdAt < today && o.status !== 'cancelled',
    )
    const openOrders = orders.filter((o) => OPEN_STATUSES.includes(o.status))
    const lateCount = openOrders.filter((o) => isLate(o, now)).length

    const sum = (list) => list.reduce((s, o) => s + orderTotal(o), 0)
    const revenueToday = sum(todayOrders)
    const revenueYesterday = sum(yesterdayOrders)
    const coversToday = todayOrders.reduce((s, o) => s + (o.guests ?? 0), 0)
    const coversYesterday = yesterdayOrders.reduce((s, o) => s + (o.guests ?? 0), 0)

    // Last 7 days revenue series
    const revenueSeries = []
    for (let d = 6; d >= 0; d -= 1) {
      const start = today - d * DAY
      const end = start + DAY
      const dayOrders = orders.filter(
        (o) => o.createdAt >= start && o.createdAt < end && o.status !== 'cancelled',
      )
      revenueSeries.push({
        day: new Date(start).toLocaleDateString(undefined, { weekday: 'short' }),
        revenue: sum(dayOrders),
        covers: dayOrders.reduce((s, o) => s + (o.guests ?? 0), 0),
        orders: dayOrders.length,
      })
    }

    // Category mix today
    const mixMap = {}
    todayOrders.forEach((o) =>
      o.items.forEach((it) => {
        const menuItem = state.menu.find((m) => m.id === it.menuId)
        const cat = menuItem ? categoryName(menuItem.categoryId) : 'Other'
        mixMap[cat] = (mixMap[cat] ?? 0) + it.price * it.qty
      }),
    )
    const mixTotal = Object.values(mixMap).reduce((a, b) => a + b, 0) || 1
    const palette = ['#245A4F', '#4F8A7A', '#8FA89E', '#C4A484', '#5C6B73', '#A3B8B0', '#D9C4A8']
    const categoryMix = Object.entries(mixMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value: Math.round((value / mixTotal) * 100),
        amount: value,
        color: palette[i % palette.length],
      }))

    // Hourly covers today
    const hourly = {}
    todayOrders.forEach((o) => {
      const h = new Date(o.createdAt).getHours()
      hourly[h] = (hourly[h] ?? 0) + (o.guests ?? 0)
    })
    const hours = Object.keys(hourly).map(Number).sort((a, b) => a - b)
    const hourlyCovers = hours.map((h) => ({ hour: `${String(h).padStart(2, '0')}:00`, covers: hourly[h] }))

    // Top sellers today
    const soldMap = {}
    todayOrders.forEach((o) =>
      o.items.forEach((it) => {
        soldMap[it.menuId] = (soldMap[it.menuId] ?? 0) + it.qty
      }),
    )

    // Table status
    const tableStatus = {}
    state.tables.forEach((t) => {
      const open = openOrders.some((o) => o.table === t.id)
      const reserved = state.reservations.some(
        (r) => r.table === t.id && (r.status === 'confirmed' || r.status === 'pending'),
      )
      tableStatus[t.id] = open ? 'occupied' : reserved ? 'reserved' : 'free'
    })

    // Waiter performance today
    const waiterStats = {}
    todayOrders.forEach((o) => {
      const w = (waiterStats[o.waiterId] ??= { orders: 0, revenue: 0, name: o.waiterName })
      w.orders += 1
      w.revenue += orderTotal(o)
    })

    const pendingReservations = state.reservations.filter((r) => r.status === 'pending').length
    const tonightReservations = state.reservations.filter((r) => r.date === 'Tonight').length

    return {
      now,
      todayOrders,
      openOrders,
      lateCount,
      revenueToday,
      revenueYesterday,
      coversToday,
      coversYesterday,
      revenueSeries,
      categoryMix,
      hourlyCovers,
      soldMap,
      tableStatus,
      waiterStats,
      pendingReservations,
      tonightReservations,
    }
  }, [state])
}
