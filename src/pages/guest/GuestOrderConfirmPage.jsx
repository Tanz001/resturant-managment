import { Link, Navigate, useParams } from 'react-router-dom'
import { CheckCircle2, Clock, Plus } from 'lucide-react'
import { orderStatusStyles } from '../../data/dashboard'
import { effectiveStatus, minutesAgo, orderTotal, useRestaurant } from '../../store/RestaurantProvider'
import { Button } from '../../components/dashboard/ui'

export default function GuestOrderConfirmPage() {
  const { tableId, orderId } = useParams()
  const { state } = useRestaurant()
  const order = state.orders.find((o) => String(o.id) === String(orderId))
  const table = state.tables.find((t) => String(t.id) === String(tableId))

  if (!order || !table) {
    return <Navigate to={tableId ? `/t/${tableId}` : '/menu'} replace />
  }

  const now = Date.now()
  const st = effectiveStatus(order, now)
  const style = orderStatusStyles[st] ?? orderStatusStyles.new
  const subtotal = orderTotal(order)
  const service = Math.round(subtotal * 0.125)
  const total = subtotal + service

  return (
    <div className="dashboard-app min-h-dvh" data-theme="light">
      <header
        className="border-b"
        style={{ background: 'var(--dash-bg)', borderColor: 'var(--dash-border)' }}
      >
        <div className="mx-auto flex h-16 max-w-lg items-center px-4">
          <p className="font-[family-name:var(--font-dash-serif)] text-lg tracking-tight">
            {state.settings.name}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="text-center">
          <span
            className="mx-auto flex size-14 items-center justify-center rounded-full"
            style={{ background: 'var(--dash-accent-soft)', color: 'var(--dash-accent-text)' }}
          >
            <CheckCircle2 className="size-7" strokeWidth={1.75} />
          </span>
          <h1 className="serif mt-5 text-3xl tracking-tight">Order received</h1>
          <p className="mt-2 text-sm dash-muted">
            Thanks{order.customerName ? `, ${order.customerName}` : ''}. The kitchen has your ticket.
          </p>
        </div>

        <div className="dash-card mt-8 space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs dash-muted">Order</p>
              <p className="text-lg font-semibold tabular-nums">#{order.id}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] ${style.className}`}>{style.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl p-3" style={{ background: 'var(--dash-surface-soft)' }}>
              <p className="text-[11px] dash-muted">Table</p>
              <p className="mt-0.5 font-medium">{order.table}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--dash-surface-soft)' }}>
              <p className="text-[11px] dash-muted">Guests</p>
              <p className="mt-0.5 font-medium">{order.guests}</p>
            </div>
          </div>

          <ul className="divide-y text-sm" style={{ borderColor: 'var(--dash-border)' }}>
            {order.items.map((it, i) => (
              <li
                key={`${it.menuId}-${i}`}
                className="flex justify-between gap-3 py-2.5"
                style={{ borderColor: 'var(--dash-border-soft)' }}
              >
                <span className="min-w-0 truncate">
                  <span className="dash-accent-text tabular-nums">{it.qty}×</span> {it.name}
                </span>
                <span className="shrink-0 tabular-nums">${it.price * it.qty}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-1 border-t pt-3 text-sm" style={{ borderColor: 'var(--dash-border)' }}>
            <div className="flex justify-between dash-muted">
              <span>Subtotal</span>
              <span className="tabular-nums">${subtotal}</span>
            </div>
            <div className="flex justify-between dash-muted">
              <span>Service 12.5%</span>
              <span className="tabular-nums">${service}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="tabular-nums">${total}</span>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-xs dash-muted">
            <Clock className="size-3.5" /> Placed {minutesAgo(order.createdAt, now)} min ago · Pay at the table
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Link to={`/t/${table.id}`}>
            <Button className="w-full" size="lg">
              <Plus className="size-4" /> Order more
            </Button>
          </Link>
          <Link to="/" className="text-center text-xs dash-muted hover:text-[#141816]">
            Back to Maison Noir
          </Link>
        </div>
      </main>
    </div>
  )
}
