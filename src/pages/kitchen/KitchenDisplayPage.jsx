import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Bell, ChefHat, Clock, Volume2, VolumeX } from 'lucide-react'
import { kitchenStatusFlow, orderStatusStyles } from '../../data/dashboard'
import { formatModifiers } from '../../data/modifiers'
import {
  KITCHEN_STATUSES,
  effectiveStatus,
  isLate,
  minutesAgo,
  useRestaurant,
} from '../../store/RestaurantProvider'
import { Button } from '../../components/dashboard/ui'

const ease = [0.22, 1, 0.36, 1]
const NEXT = { new: 'preparing', preparing: 'ready', ready: 'served' }

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 880
    g.gain.value = 0.04
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    o.stop(ctx.currentTime + 0.4)
  } catch {
    /* ignore */
  }
}

export default function KitchenDisplayPage() {
  const { state, actions } = useRestaurant()
  const reduce = useReducedMotion()
  const [now, setNow] = useState(Date.now())
  const [sound, setSound] = useState(true)
  const seen = useRef(new Set())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(t)
  }, [])

  const tickets = useMemo(
    () =>
      state.orders
        .filter((o) => KITCHEN_STATUSES.includes(o.status))
        .sort((a, b) => a.createdAt - b.createdAt),
    [state.orders],
  )

  useEffect(() => {
    const ids = tickets.map((t) => t.id)
    const fresh = ids.filter((id) => !seen.current.has(id) && tickets.find((t) => t.id === id)?.status === 'new')
    if (seen.current.size && fresh.length && sound) playChime()
    ids.forEach((id) => seen.current.add(id))
  }, [tickets, sound])

  const columns = kitchenStatusFlow.map((status) => ({
    status,
    label: orderStatusStyles[status].label,
    items: tickets.filter((t) => t.status === status),
  }))

  return (
    <div className="dashboard-app min-h-dvh" data-theme="dark">
      <header
        className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 md:px-6"
        style={{ background: 'var(--dash-header-bg)', borderColor: 'var(--dash-border)' }}
      >
        <span
          className="flex size-9 items-center justify-center rounded-lg"
          style={{ background: 'var(--dash-accent)', color: 'var(--dash-accent-ink)' }}
        >
          <ChefHat className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-medium md:text-lg">Kitchen display</h1>
          <p className="text-xs dash-muted">
            {tickets.length} open · {tickets.filter((t) => isLate(t, now)).length} late
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSound((s) => !s)}
          className="rounded-lg p-2 dash-soft"
          aria-label={sound ? 'Mute alerts' : 'Enable alerts'}
        >
          {sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>
        <Link to="/manager" className="hidden text-xs dash-accent sm:inline">
          Manager
        </Link>
        <Link to="/waiter" className="text-xs dash-muted hover:text-[var(--dash-text)]">
          Waiter
        </Link>
      </header>

      <div className="grid gap-4 p-4 md:grid-cols-3 md:p-6">
        {columns.map((col) => (
          <section key={col.status} className="min-h-[50vh]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium tracking-wide uppercase dash-muted">
                {col.label}
                <span className="ml-2 tabular-nums dash-subtle">{col.items.length}</span>
              </h2>
            </div>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {col.items.map((order) => {
                  const late = isLate(order, now)
                  const st = effectiveStatus(order, now)
                  const next = NEXT[order.status]
                  return (
                    <motion.article
                      key={order.id}
                      layout
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                      transition={{ duration: reduce ? 0.01 : 0.28, ease }}
                      className={`dash-card overflow-hidden p-4 ${late ? 'ring-1 ring-rose-500/50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-[family-name:var(--font-dash-serif)] text-2xl leading-none">
                            T{order.table}
                          </p>
                          <p className="mt-1 text-xs dash-muted">
                            #{order.id} · {order.customerName || order.waiterName}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${orderStatusStyles[st].className}`}
                        >
                          <Clock className="size-3" />
                          {minutesAgo(order.createdAt, now)}m
                        </span>
                      </div>

                      <ul className="mt-3 space-y-2 border-t pt-3 text-sm" style={{ borderColor: 'var(--dash-border)' }}>
                        {order.items.map((it, i) => (
                          <li key={`${it.menuId}-${i}`}>
                            <p className="font-medium">
                              <span className="tabular-nums dash-accent-text">{it.qty}×</span> {it.name}
                            </p>
                            {it.modifiers?.length ? (
                              <p className="text-[11px] dash-muted">{formatModifiers(it.modifiers)}</p>
                            ) : null}
                            {it.notes ? <p className="text-[11px] italic dash-subtle">“{it.notes}”</p> : null}
                          </li>
                        ))}
                      </ul>

                      {order.notes ? (
                        <p
                          className="mt-3 rounded-lg px-2.5 py-2 text-xs"
                          style={{ background: 'var(--dash-accent-soft)', color: 'var(--dash-accent-text)' }}
                        >
                          {order.notes}
                        </p>
                      ) : null}

                      <div className="mt-4 flex gap-2">
                        {next ? (
                          <Button
                            className="flex-1"
                            size="sm"
                            onClick={() => actions.setOrderStatus(order.id, next)}
                          >
                            {next === 'preparing' ? (
                              <>
                                <ChefHat className="size-3.5" /> Start
                              </>
                            ) : next === 'ready' ? (
                              <>
                                <Bell className="size-3.5" /> Mark ready
                              </>
                            ) : (
                              'Bump / served'
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </motion.article>
                  )
                })}
              </AnimatePresence>
              {col.items.length === 0 ? (
                <p className="rounded-xl border border-dashed px-3 py-8 text-center text-xs dash-subtle" style={{ borderColor: 'var(--dash-border)' }}>
                  Empty
                </p>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
