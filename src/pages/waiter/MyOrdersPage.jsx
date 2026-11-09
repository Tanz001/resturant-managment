import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { BellRing, CheckCircle2, Clock, Plus } from 'lucide-react'
import { orderStatusStyles } from '../../data/dashboard'
import { OPEN_STATUSES, effectiveStatus, minutesAgo, orderTotal, useRestaurant } from '../../store/RestaurantProvider'
import { Button, EmptyState, useToast } from '../../components/dashboard/ui'
import { printOrderReceipt } from '../../components/dashboard/OrderReceipt'
import { OrderDrawer } from '../dashboard/OrdersPage'

export default function MyOrdersPage() {
  const { state, actions } = useRestaurant()
  const { waiter } = useOutletContext()
  const { toast, ToastView } = useToast()
  const [tab, setTab] = useState('open')
  const [selected, setSelected] = useState(null)
  const [, tick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const now = Date.now()
  const startToday = new Date(now).setHours(0, 0, 0, 0)

  const mine = useMemo(
    () => state.orders.filter((o) => o.waiterId === waiter?.id && o.createdAt >= startToday).sort((a, b) => b.createdAt - a.createdAt),
    [state.orders, waiter, startToday],
  )
  const open = mine.filter((o) => OPEN_STATUSES.includes(o.status))
  const done = mine.filter((o) => !OPEN_STATUSES.includes(o.status))
  const list = tab === 'open' ? open : done
  const ready = open.filter((o) => o.status === 'ready')
  const revenue = mine.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + orderTotal(o), 0)
  const selectedOrder = selected ? state.orders.find((o) => o.id === selected) : null

  return (
    <div className="space-y-5">
      <ToastView />

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Open tickets" value={open.length} accent />
        <Kpi label="Ready to serve" value={ready.length} pulse={ready.length > 0} />
        <Kpi label="My sales today" value={`$${revenue.toLocaleString()}`} />
      </div>

      {ready.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'var(--dash-accent-soft)', color: 'var(--dash-accent-text)' }}
        >
          <BellRing className="size-4 motion-safe:animate-[wiggle_1s_ease-in-out_infinite]" />
          {ready.length === 1 ? `Table ${ready[0].table} is ready at the pass.` : `${ready.length} tables are ready at the pass.`}
        </motion.div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="dash-chip flex rounded-lg p-0.5">
          {[
            ['open', `Open · ${open.length}`],
            ['done', `Served · ${done.length}`],
          ].map(([k, label]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-md px-3 py-1.5 text-xs ${tab === k ? 'dash-btn-primary' : 'dash-soft'}`}>
              {label}
            </button>
          ))}
        </div>
        <Link to="/waiter">
          <Button size="sm">
            <Plus className="size-4" /> New order
          </Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={tab === 'open' ? 'No open tickets' : 'Nothing served yet'}
          description={tab === 'open' ? 'Take a new order and it will appear here with live kitchen status.' : 'Served and cancelled orders from today show here.'}
          action={
            tab === 'open' ? (
              <Link to="/waiter">
                <Button>Take an order</Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <motion.div layout className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {list.map((o) => {
              const st = effectiveStatus(o, now)
              const style = orderStatusStyles[st]
              return (
                <motion.article
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className={`dash-card p-4 ${st === 'ready' ? 'ring-2 ring-emerald-500/50' : ''}`}
                >
                  <button type="button" onClick={() => setSelected(o.id)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-[family-name:var(--font-dash-serif)] text-2xl leading-none">Table {o.table}</p>
                        <p className="mt-1 text-xs dash-muted">
                          #{o.id} · {o.guests} guests
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${style.className}`}>{style.label}</span>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm">
                      {o.items.slice(0, 3).map((it, i) => (
                        <li key={i} className="flex justify-between gap-2">
                          <span className="truncate">
                            <span className="dash-accent-text tabular-nums">{it.qty}×</span> {it.name}
                          </span>
                          <span className="shrink-0 tabular-nums dash-muted">${it.price * it.qty}</span>
                        </li>
                      ))}
                      {o.items.length > 3 ? <li className="text-xs dash-subtle">+{o.items.length - 3} more</li> : null}
                    </ul>
                  </button>
                  <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs" style={{ borderColor: 'var(--dash-border)' }}>
                    <span className="flex items-center gap-1.5 dash-muted">
                      <Clock className="size-3.5" /> {minutesAgo(o.createdAt, now)} min
                    </span>
                    <span className="text-sm font-semibold tabular-nums">${orderTotal(o)}</span>
                  </div>
                  {o.status === 'ready' ? (
                    <Button
                      className="mt-3 w-full"
                      onClick={() => {
                        actions.setOrderStatus(o.id, 'served')
                        toast(`Table ${o.table} served`, 'success')
                      }}
                    >
                      <CheckCircle2 className="size-4" /> Mark served
                    </Button>
                  ) : null}
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <OrderDrawer
        order={selectedOrder}
        waiter={waiter}
        restaurant={state.settings}
        onClose={() => setSelected(null)}
        onStatus={(s) => {
          if (selectedOrder) actions.setOrderStatus(selectedOrder.id, s)
        }}
        onUpdate={(patch) => selectedOrder && actions.updateOrder(selectedOrder.id, patch)}
        onPrint={() =>
          selectedOrder &&
          printOrderReceipt(selectedOrder, { restaurant: state.settings, waiter })
        }
      />

      <style>{`@keyframes wiggle{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}`}</style>
    </div>
  )
}

function Kpi({ label, value, accent, pulse }) {
  return (
    <div className="dash-card relative p-4">
      <p className="text-xs dash-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${accent ? 'dash-accent-text' : ''}`}>{value}</p>
      {pulse ? <span className="absolute top-4 right-4 size-2 animate-ping rounded-full bg-emerald-400 motion-reduce:hidden" /> : null}
    </div>
  )
}
