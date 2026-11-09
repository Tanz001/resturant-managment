import { useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import { orderStatusStyles } from '../../data/dashboard'
import { effectiveStatus, orderTotal, useDerived, useRestaurant } from '../../store/RestaurantProvider'
import { Avatar } from '../../components/dashboard/ui'

function useChartTheme() {
  const ctx = useOutletContext() ?? {}
  return useMemo(() => {
    const root = typeof document !== 'undefined' ? document.querySelector('.dashboard-app') : null
    const styles = root ? getComputedStyle(root) : null
    const read = (name, fallback) => styles?.getPropertyValue(name).trim() || fallback
    return {
      grid: read('--dash-chart-grid', 'rgba(255,255,255,0.06)'),
      tick: read('--dash-chart-tick', '#8b93a0'),
      accent: read('--dash-accent', '#245a4f'),
      tooltip: {
        background: read('--dash-tooltip-bg', '#161c24'),
        border: `1px solid ${read('--dash-tooltip-border', 'rgba(255,255,255,0.1)')}`,
        borderRadius: 8,
        color: read('--dash-text', '#f4f1ea'),
        fontSize: 12,
      },
    }
  }, [ctx.isLight])
}

function pct(curr, prev) {
  if (!prev) return null
  return Math.round(((curr - prev) / prev) * 100)
}

export default function OverviewPage() {
  const chart = useChartTheme()
  const { state } = useRestaurant()
  const d = useDerived()

  const kpis = [
    {
      id: 'revenue',
      label: 'Today’s revenue',
      value: `$${d.revenueToday.toLocaleString()}`,
      delta: pct(d.revenueToday, d.revenueYesterday),
      hint: 'vs yesterday',
    },
    {
      id: 'covers',
      label: 'Covers seated',
      value: d.coversToday,
      delta: pct(d.coversToday, d.coversYesterday),
      hint: 'vs yesterday',
    },
    {
      id: 'orders',
      label: 'Open orders',
      value: d.openOrders.length,
      deltaText: d.lateCount ? `${d.lateCount} late` : 'On time',
      negative: d.lateCount > 0,
      hint: 'kitchen queue',
    },
    {
      id: 'reservations',
      label: 'Reservations tonight',
      value: d.tonightReservations,
      deltaText: `${d.pendingReservations} pending`,
      hint: 'needs confirmation',
    },
  ]

  const liveOrders = [...d.openOrders].sort((a, b) => a.createdAt - b.createdAt).slice(0, 6)
  const topWaiters = Object.entries(d.waiterStats)
    .map(([id, s]) => ({ id, ...s, avatar: state.staff.find((x) => x.id === id)?.avatar }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4)
  const avgTicket = d.todayOrders.length ? Math.round(d.revenueToday / d.todayOrders.length) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.id} className="dash-card p-4 md:p-5">
            <p className="text-xs tracking-wide dash-muted">{kpi.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="font-[family-name:var(--font-dash-serif)] text-3xl tracking-tight tabular-nums">{kpi.value}</p>
              {kpi.delta !== undefined && kpi.delta !== null ? (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${kpi.delta >= 0 ? 'dash-delta-pos' : 'dash-delta-neg'}`}>
                  {kpi.delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {kpi.delta >= 0 ? '+' : ''}
                  {kpi.delta}%
                </span>
              ) : (
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${kpi.negative ? 'dash-delta-neg' : 'dash-delta-pos'}`}>{kpi.deltaText}</span>
              )}
            </div>
            <p className="mt-2 text-[11px] dash-subtle">{kpi.hint}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <article className="dash-card p-4 md:p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">Revenue · last 7 days</h2>
              <p className="text-xs dash-muted">Gross sales from all orders</p>
            </div>
            <div className="text-right">
              <p className="text-xs dash-muted">Avg ticket today</p>
              <p className="text-sm font-medium tabular-nums">${avgTicket}</p>
            </div>
          </div>
          <div className="h-64 w-full md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.revenueSeries}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chart.accent} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={chart.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="day" tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip
                  contentStyle={chart.tooltip}
                  formatter={(value, name) => (name === 'revenue' ? [`$${value.toLocaleString()}`, 'Revenue'] : [value, name])}
                />
                <Area type="monotone" dataKey="revenue" stroke={chart.accent} strokeWidth={2.5} fill="url(#revFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-card p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-sm font-medium">Sales mix</h2>
            <p className="text-xs dash-muted">By category today</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={d.categoryMix} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={3}>
                  {d.categoryMix.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chart.tooltip} formatter={(v, _n, p) => [`${v}% · $${p.payload.amount.toLocaleString()}`, p.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {d.categoryMix.slice(0, 5).map((item) => (
              <li key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 dash-soft">
                  <span className="size-2 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </span>
                <span className="tabular-nums">{item.value}%</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <article className="dash-card p-4 md:p-5 xl:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-medium">Covers by hour</h2>
            <p className="text-xs dash-muted">Today’s seating curve</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.hourlyCovers}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={chart.tooltip} />
                <Bar dataKey="covers" fill="#7c9a92" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 border-t pt-4" style={{ borderColor: 'var(--dash-border)' }}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Top waiters today</h3>
              <Link to="/manager/staff" className="text-xs dash-accent hover:opacity-80">
                Team
              </Link>
            </div>
            <ul className="space-y-2.5">
              {topWaiters.map((w) => (
                <li key={w.id} className="flex items-center gap-3 text-sm">
                  <Avatar src={w.avatar} name={w.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{w.name}</p>
                    <p className="text-xs dash-muted">{w.orders} orders</p>
                  </div>
                  <p className="tabular-nums">${w.revenue.toLocaleString()}</p>
                </li>
              ))}
              {topWaiters.length === 0 ? <li className="text-xs dash-muted">No orders yet today.</li> : null}
            </ul>
          </div>
        </article>

        <article className="dash-card p-4 md:p-5 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">Live orders</h2>
              <p className="text-xs dash-muted">Oldest first · updates as waiters send tickets</p>
            </div>
            <Link to="/manager/orders" className="inline-flex items-center gap-1 text-xs dash-accent hover:opacity-80">
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs dash-muted" style={{ borderColor: 'var(--dash-border)' }}>
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Table</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Waiter</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {liveOrders.map((order) => {
                  const st = effectiveStatus(order, d.now)
                  const status = orderStatusStyles[st]
                  return (
                    <tr key={order.id} className="border-b" style={{ borderColor: 'var(--dash-border-soft)' }}>
                      <td className="py-3 tabular-nums">#{order.id}</td>
                      <td className="py-3">{order.table}</td>
                      <td className="py-3 dash-soft">
                        <span className="block max-w-[200px] truncate">{order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</span>
                      </td>
                      <td className="py-3 dash-soft">{order.waiterName}</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${status.className}`}>{status.label}</span>
                      </td>
                      <td className="py-3 text-right tabular-nums">${orderTotal(order)}</td>
                    </tr>
                  )
                })}
                {liveOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs dash-muted">
                      Kitchen is clear. New tickets from the waiter app will show here.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
  )
}
