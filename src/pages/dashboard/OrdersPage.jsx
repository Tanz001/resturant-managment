import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Banknote,
  BellRing,
  CheckCircle2,
  ChefHat,
  Clock,
  Eye,
  Printer,
  Search,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  XCircle,
} from 'lucide-react'
import { orderStatusFlow, orderStatusStyles, paymentStatusStyles } from '../../data/dashboard'
import { formatModifiers, lineUnitPrice } from '../../data/modifiers'
import {
  billTotals,
  effectiveStatus,
  minutesAgo,
  orderItemCount,
  orderTotal,
  useRestaurant,
} from '../../store/RestaurantProvider'
import { printOrderReceipt } from '../../components/dashboard/OrderReceipt'
import { Avatar, Button, Drawer, Dropdown, EmptyState, SelectMenu, useToast } from '../../components/dashboard/ui'

const filters = ['all', 'new', 'preparing', 'ready', 'late', 'served', 'cancelled']
const ranges = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: 'all', label: 'All time' },
]

export default function OrdersPage() {
  const { state, actions } = useRestaurant()
  const { toast, ToastView } = useToast()
  const [filter, setFilter] = useState('all')
  const [range, setRange] = useState('today')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [, tick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const now = Date.now()
  const startToday = new Date(now).setHours(0, 0, 0, 0)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...state.orders]
      .filter((o) => {
        if (range === 'today' && o.createdAt < startToday) return false
        if (range === '7d' && o.createdAt < startToday - 6 * 86400000) return false
        const st = effectiveStatus(o, now)
        if (filter !== 'all' && st !== filter) return false
        if (q) {
          const hay = `${o.id} ${o.table} ${o.waiterName} ${o.customerName ?? ''} ${o.items.map((i) => i.name).join(' ')}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [state.orders, filter, range, query, now, startToday])

  const stats = useMemo(() => {
    const active = rows.filter((o) => !['cancelled', 'served'].includes(o.status))
    const late = rows.filter((o) => effectiveStatus(o, now) === 'late').length
    const ready = rows.filter((o) => o.status === 'ready').length
    const revenue = rows.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + orderTotal(o), 0)
    const items = rows.reduce((s, o) => s + orderItemCount(o), 0)
    const avg = rows.filter((o) => o.status !== 'cancelled').length
      ? Math.round(revenue / rows.filter((o) => o.status !== 'cancelled').length)
      : 0
    return {
      orders: rows.length,
      open: active.length,
      late,
      ready,
      revenue,
      items,
      avg,
    }
  }, [rows, now])

  const selectedOrder = selected ? state.orders.find((o) => o.id === selected) : null
  const waiterOf = (o) => state.staff.find((s) => s.id === o.waiterId)

  const setStatus = (o, status) => {
    actions.setOrderStatus(o.id, status)
    toast(`Order #${o.id} → ${orderStatusStyles[status].label}`, status === 'served' ? 'success' : 'default')
  }

  const printOrder = (o) => {
    printOrderReceipt(o, {
      restaurant: state.settings,
      waiter: waiterOf(o),
    })
  }

  return (
    <div className="space-y-5">
      <ToastView />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders in view"
          value={stats.orders}
          hint={`${stats.open} open · ${stats.ready} ready`}
          icon={ShoppingBag}
          tone="default"
        />
        <StatCard
          label="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          hint={`Avg ticket $${stats.avg}`}
          icon={Banknote}
          tone="accent"
        />
        <StatCard
          label="Items sold"
          value={stats.items}
          hint="Across filtered orders"
          icon={UtensilsCrossed}
          tone="default"
        />
        <StatCard
          label="Needs attention"
          value={stats.late}
          hint={stats.late ? 'Late kitchen tickets' : 'Kitchen on time'}
          icon={Clock}
          tone={stats.late ? 'danger' : 'ok'}
        />
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-[11px] tracking-wide capitalize transition-colors ${
                filter === f ? 'dash-chip-active' : 'dash-chip hover:opacity-80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 dash-subtle" strokeWidth={1.75} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order #, guest, table, waiter…"
              className="dash-input h-10 w-64 rounded-lg border-0 pr-3 pl-9 text-sm"
            />
          </label>
          <SelectMenu value={range} options={ranges} onChange={setRange} />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No orders here" description="Orders placed from the waiter app appear instantly." />
      ) : (
        <div className="dash-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead style={{ background: 'var(--dash-surface-soft)' }}>
                <tr className="border-b text-xs dash-muted" style={{ borderColor: 'var(--dash-border)' }}>
                  <th className="px-4 py-3 font-medium md:px-5">Order</th>
                  <th className="px-4 py-3 font-medium md:px-5">Customer</th>
                  <th className="px-4 py-3 font-medium md:px-5">Guests</th>
                  <th className="px-4 py-3 font-medium md:px-5">Table</th>
                  <th className="px-4 py-3 font-medium md:px-5">Waiter</th>
                  <th className="px-4 py-3 font-medium md:px-5">Placed</th>
                  <th className="px-4 py-3 font-medium md:px-5">Status</th>
                  <th className="px-4 py-3 text-right font-medium md:px-5">Total</th>
                  <th className="px-4 py-3 md:px-5" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.map((order) => {
                    const st = effectiveStatus(order, now)
                    const style = orderStatusStyles[st]
                    const w = waiterOf(order)
                    return (
                      <motion.tr
                        key={order.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelected(order.id)}
                        className="dash-row-hover cursor-pointer border-b"
                        style={{ borderColor: 'var(--dash-border-soft)' }}
                      >
                        <td className="px-4 py-3 font-medium tabular-nums md:px-5">#{order.id}</td>
                        <td className="px-4 py-3 font-medium md:px-5">
                          {order.customerName?.trim() || 'Walk-in'}
                        </td>
                        <td className="px-4 py-3 tabular-nums md:px-5">{order.guests ?? 1}</td>
                        <td className="px-4 py-3 md:px-5">Table {order.table}</td>
                        <td className="px-4 py-3 md:px-5">
                          <span className="flex items-center gap-2">
                            <Avatar src={w?.avatar} name={order.waiterName} size="xs" />
                            {order.waiterName}
                          </span>
                        </td>
                        <td className="px-4 py-3 tabular-nums dash-soft md:px-5">
                          {formatPlaced(order.createdAt, now)}
                        </td>
                        <td className="px-4 py-3 md:px-5" onClick={(e) => e.stopPropagation()}>
                          <SelectMenu
                            size="sm"
                            value={order.status}
                            onChange={(s) => setStatus(order, s)}
                            options={[...orderStatusFlow, 'cancelled'].map((s) => ({
                              value: s,
                              label: orderStatusStyles[s].label,
                              badge:
                                s === order.status && st === 'late'
                                  ? style.className
                                  : orderStatusStyles[s].className,
                            }))}
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums md:px-5">
                          ${orderTotal(order)}
                        </td>
                        <td className="px-4 py-3 text-right md:px-5" onClick={(e) => e.stopPropagation()}>
                          <OrderMenu
                            order={order}
                            onView={() => setSelected(order.id)}
                            onStatus={(s) => setStatus(order, s)}
                            onPrint={() => printOrder(order)}
                            onRemove={() => actions.removeOrder(order.id)}
                          />
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <OrderDrawer
        order={selectedOrder}
        waiter={selectedOrder ? waiterOf(selectedOrder) : null}
        restaurant={state.settings}
        onClose={() => setSelected(null)}
        onStatus={(s) => selectedOrder && setStatus(selectedOrder, s)}
        onUpdate={(patch) => selectedOrder && actions.updateOrder(selectedOrder.id, patch)}
        onPrint={() => selectedOrder && printOrder(selectedOrder)}
      />
    </div>
  )
}

function StatCard({ label, value, hint, icon: Icon, tone = 'default' }) {
  const toneClass =
    tone === 'accent'
      ? 'dash-accent-text'
      : tone === 'danger'
        ? 'text-rose-400'
        : tone === 'ok'
          ? 'text-emerald-400'
          : ''
  return (
    <article className="dash-card p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide dash-muted">{label}</p>
          <p className={`mt-2 font-[family-name:var(--font-dash-serif)] text-3xl tracking-tight tabular-nums ${toneClass}`}>
            {value}
          </p>
          <p className="mt-2 text-[11px] dash-subtle">{hint}</p>
        </div>
        <span
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ background: 'var(--dash-accent-soft)', color: 'var(--dash-accent-text)' }}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
      </div>
    </article>
  )
}

function OrderMenu({ order, onView, onStatus, onPrint, onRemove }) {
  const next = orderStatusFlow[orderStatusFlow.indexOf(order.status) + 1]
  return (
    <Dropdown
      items={[
        { label: 'View details', icon: Eye, onClick: onView },
        { label: 'Print receipt', icon: Printer, onClick: onPrint },
        next
          ? {
              label: `Mark ${orderStatusStyles[next].label.toLowerCase()}`,
              icon: next === 'served' ? CheckCircle2 : next === 'ready' ? BellRing : ChefHat,
              onClick: () => onStatus(next),
            }
          : null,
        'divider',
        order.status !== 'cancelled' && order.status !== 'served'
          ? { label: 'Cancel order', icon: XCircle, danger: true, onClick: () => onStatus('cancelled') }
          : { label: 'Delete record', icon: Trash2, danger: true, onClick: onRemove },
      ].filter(Boolean)}
    />
  )
}

export function OrderDrawer({ order, waiter, restaurant, onClose, onStatus, onUpdate, onPrint, readOnly = false }) {
  const now = Date.now()
  const st = order ? effectiveStatus(order, now) : null
  const next = order ? orderStatusFlow[orderStatusFlow.indexOf(order.status) + 1] : null
  const pay = order ? paymentStatusStyles[order.paymentStatus] ?? paymentStatusStyles.unpaid : null
  const bill = order ? billTotals(order) : null

  const markPaid = (method) => {
    onUpdate?.({
      paymentStatus: 'paid',
      paymentMethod: method,
      tip: Number(order.tip) || 0,
      discount: Number(order.discount) || 0,
    })
  }

  return (
    <Drawer
      open={Boolean(order)}
      onClose={onClose}
      title={order ? `Order #${order.id}` : ''}
      description={
        order
          ? `${order.customerName?.trim() || 'Walk-in'} · Table ${order.table} · ${order.guests} guests · ${formatPlaced(order.createdAt, now)}`
          : ''
      }
      footer={
        order && !readOnly ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={onPrint}>
              <Printer className="size-4" /> Print receipt
            </Button>
            {next ? (
              <Button className="flex-1" onClick={() => onStatus(next)}>
                Mark {orderStatusStyles[next].label.toLowerCase()}
              </Button>
            ) : null}
            {order.status !== 'cancelled' && order.status !== 'served' ? (
              <Button variant="danger" onClick={() => onStatus('cancelled')}>
                Cancel
              </Button>
            ) : null}
          </div>
        ) : order ? (
          <Button className="w-full" variant="ghost" onClick={onPrint}>
            <Printer className="size-4" /> Print receipt
          </Button>
        ) : null
      }
    >
      {order ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs ${orderStatusStyles[st].className}`}>
                {orderStatusStyles[st].label}
              </span>
              {pay ? (
                <span className={`rounded-full px-2.5 py-1 text-xs ${pay.className}`}>{pay.label}</span>
              ) : null}
            </div>
            <span className="flex items-center gap-1.5 text-xs dash-muted">
              <Clock className="size-3.5" strokeWidth={1.75} /> {minutesAgo(order.createdAt, now)} min elapsed
            </span>
          </div>

          <ol className="flex items-center gap-2">
            {orderStatusFlow.map((s, i) => {
              const reached = orderStatusFlow.indexOf(order.status) >= i && order.status !== 'cancelled'
              return (
                <li key={s} className="flex flex-1 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: reached ? 'var(--dash-accent)' : 'var(--dash-border)' }}
                  />
                  <span className={`text-[11px] ${reached ? '' : 'dash-subtle'}`}>{orderStatusStyles[s].label}</span>
                  {i < orderStatusFlow.length - 1 ? (
                    <span className="h-px flex-1" style={{ background: 'var(--dash-border)' }} />
                  ) : null}
                </li>
              )
            })}
          </ol>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl p-3" style={{ background: 'var(--dash-surface-soft)' }}>
              <p className="text-[11px] dash-muted">Guest</p>
              <p className="mt-1 text-sm font-medium">{order.customerName?.trim() || 'Walk-in guest'}</p>
              <p className="text-xs dash-muted">{order.guests ?? 1} guests · Table {order.table}</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'var(--dash-surface-soft)' }}>
              <Avatar src={waiter?.avatar} name={waiter?.name ?? order.waiterName} size="sm" />
              <div className="text-sm">
                <p className="font-medium">{waiter?.name ?? order.waiterName}</p>
                <p className="text-xs dash-muted">Waiter · {waiter?.shift ?? 'Evening'} shift</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium dash-muted">Items</p>
            <ul className="divide-y" style={{ borderColor: 'var(--dash-border)' }}>
              {order.items.map((it, i) => (
                <li
                  key={`${it.menuId}-${i}`}
                  className="flex items-start justify-between gap-3 py-2.5 text-sm"
                  style={{ borderColor: 'var(--dash-border-soft)' }}
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      <span className="tabular-nums dash-accent-text">{it.qty}×</span> {it.name}
                    </p>
                    {it.modifiers?.length ? (
                      <p className="text-xs dash-muted">{formatModifiers(it.modifiers)}</p>
                    ) : null}
                    {it.notes ? <p className="text-xs dash-muted">“{it.notes}”</p> : null}
                  </div>
                  <p className="shrink-0 tabular-nums">${lineUnitPrice(it) * it.qty}</p>
                </li>
              ))}
            </ul>
          </div>

          {order.notes ? (
            <div
              className="rounded-xl p-3 text-sm"
              style={{ background: 'var(--dash-accent-soft)', color: 'var(--dash-accent-text)' }}
            >
              <p className="text-[11px] font-medium tracking-wide uppercase opacity-80">Kitchen note</p>
              <p className="mt-1">{order.notes}</p>
            </div>
          ) : null}

          {!readOnly && order.paymentStatus !== 'paid' && order.status !== 'cancelled' ? (
            <div className="space-y-3 rounded-xl p-3" style={{ background: 'var(--dash-surface-soft)' }}>
              <p className="text-xs font-medium dash-muted">Bill & payment</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] dash-muted">
                  Discount $
                  <input
                    type="number"
                    min="0"
                    value={order.discount ?? 0}
                    onChange={(e) => onUpdate?.({ discount: Math.max(0, Number(e.target.value) || 0) })}
                    className="dash-input mt-1 h-9 w-full rounded-lg border-0 px-2 text-sm outline-none"
                  />
                </label>
                <label className="text-[11px] dash-muted">
                  Tip $
                  <input
                    type="number"
                    min="0"
                    value={order.tip ?? 0}
                    onChange={(e) => onUpdate?.({ tip: Math.max(0, Number(e.target.value) || 0) })}
                    className="dash-input mt-1 h-9 w-full rounded-lg border-0 px-2 text-sm outline-none"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.paymentStatus !== 'requested' ? (
                  <Button size="sm" variant="ghost" onClick={() => onUpdate?.({ paymentStatus: 'requested' })}>
                    Request bill
                  </Button>
                ) : null}
                <Button size="sm" onClick={() => markPaid('cash')}>
                  <Banknote className="size-3.5" /> Cash
                </Button>
                <Button size="sm" onClick={() => markPaid('card')}>
                  Card
                </Button>
                <Button size="sm" variant="ghost" onClick={() => markPaid('mixed')}>
                  Mixed
                </Button>
              </div>
            </div>
          ) : null}

          {order.paymentStatus === 'paid' ? (
            <p className="rounded-xl px-3 py-2 text-xs dash-badge-emerald">
              Paid{order.paymentMethod ? ` · ${order.paymentMethod}` : ''}
            </p>
          ) : null}

          <div className="space-y-1.5 border-t pt-4 text-sm" style={{ borderColor: 'var(--dash-border)' }}>
            <Row label="Subtotal" value={`$${bill.subtotal}`} />
            {bill.discount > 0 ? <Row label="Discount" value={`−$${bill.discount}`} /> : null}
            <Row label="Service (12.5%)" value={`$${bill.service}`} />
            {bill.tip > 0 ? <Row label="Tip" value={`$${bill.tip}`} /> : null}
            <Row label="Total" value={`$${bill.total}`} strong />
          </div>

          {restaurant?.name ? (
            <p className="text-center text-[11px] dash-subtle">{restaurant.name} · guest receipt available via Print</p>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  )
}

function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between ${strong ? 'text-base font-semibold' : 'dash-muted'}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

export function formatPlaced(ts, now = Date.now()) {
  const mins = minutesAgo(ts, now)
  if (mins < 60) return `${mins} min ago`
  const d = new Date(ts)
  const sameDay = new Date(now).toDateString() === d.toDateString()
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return time
  return `${d.toLocaleDateString(undefined, { weekday: 'short' })} ${time}`
}
