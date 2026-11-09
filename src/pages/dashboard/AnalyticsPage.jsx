import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
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
import { billTotals, useDerived, useRestaurant } from '../../store/RestaurantProvider'
import { paymentStatusStyles } from '../../data/dashboard'

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

export default function AnalyticsPage() {
  const chart = useChartTheme()
  const { state } = useRestaurant()
  const d = useDerived()
  const unpaidTotal = d.unpaidOrders.reduce((s, o) => s + billTotals(o).total, 0)

  const kpis = [
    { label: 'Avg ticket', value: `$${d.avgTicket}`, hint: 'Today' },
    { label: 'Tips collected', value: `$${d.tipsToday}`, hint: 'Paid orders' },
    { label: 'Discounts', value: `$${d.discountsToday}`, hint: 'Given today' },
    {
      label: 'Open bills',
      value: d.unpaidOrders.length,
      hint: `$${unpaidTotal} outstanding`,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium">Service analytics</h2>
        <p className="text-xs dash-muted">
          Peak hour today: {d.peakHour ? `${d.peakHour.hour} · ${d.peakHour.covers} covers` : '—'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <article key={k.label} className="dash-card p-4">
            <p className="text-xs dash-muted">{k.label}</p>
            <p className="mt-2 font-[family-name:var(--font-dash-serif)] text-3xl tabular-nums">{k.value}</p>
            <p className="mt-1 text-[11px] dash-subtle">{k.hint}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <article className="dash-card p-4 md:p-5 xl:col-span-2">
          <h3 className="text-sm font-medium">Covers by hour</h3>
          <p className="mb-4 text-xs dash-muted">Demand curve for staffing</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.hourlyCovers}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={chart.tooltip} />
                <Bar dataKey="covers" fill={chart.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-card p-4 md:p-5">
          <h3 className="text-sm font-medium">Payment mix</h3>
          <p className="mb-4 text-xs dash-muted">Paid revenue today</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={d.paymentMix} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>
                  {d.paymentMix.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chart.tooltip} formatter={(v) => [`$${v}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5 text-xs">
            {d.paymentMix.map((p) => (
              <li key={p.name} className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </span>
                <span className="tabular-nums">${p.value}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="dash-card p-4 md:p-5">
          <h3 className="mb-3 text-sm font-medium">Top dishes today</h3>
          <ul className="space-y-2">
            {d.topDishes.map((dish, i) => (
              <li key={dish.menuId} className="flex items-center gap-3 text-sm">
                <span className="w-5 tabular-nums dash-subtle">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{dish.name}</p>
                  <p className="text-[11px] dash-muted">{dish.qty} sold</p>
                </div>
                <span className="tabular-nums">${dish.revenue}</span>
              </li>
            ))}
            {d.topDishes.length === 0 ? <li className="text-xs dash-muted">No sales yet.</li> : null}
          </ul>
        </article>

        <article className="dash-card p-4 md:p-5">
          <h3 className="mb-3 text-sm font-medium">Open bills</h3>
          <ul className="divide-y text-sm" style={{ borderColor: 'var(--dash-border)' }}>
            {d.unpaidOrders.slice(0, 10).map((o) => {
              const pay = paymentStatusStyles[o.paymentStatus] ?? paymentStatusStyles.unpaid
              const bill = billTotals(o)
              return (
                <li key={o.id} className="flex items-center gap-3 py-2.5" style={{ borderColor: 'var(--dash-border-soft)' }}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      #{o.id} · Table {o.table}
                    </p>
                    <p className="truncate text-[11px] dash-muted">{o.customerName || o.waiterName}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${pay.className}`}>{pay.label}</span>
                  <span className="w-16 text-right tabular-nums">${bill.total}</span>
                </li>
              )
            })}
            {d.unpaidOrders.length === 0 ? (
              <li className="py-6 text-center text-xs dash-muted">All caught up.</li>
            ) : null}
          </ul>
        </article>
      </div>

      <article className="dash-card p-4 md:p-5">
        <h3 className="mb-3 text-sm font-medium">7-day revenue</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs dash-muted" style={{ borderColor: 'var(--dash-border)' }}>
                <th className="pb-2 font-medium">Day</th>
                <th className="pb-2 font-medium">Orders</th>
                <th className="pb-2 font-medium">Covers</th>
                <th className="pb-2 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {d.revenueSeries.map((row) => (
                <tr key={row.day} className="border-b" style={{ borderColor: 'var(--dash-border-soft)' }}>
                  <td className="py-2.5">{row.day}</td>
                  <td className="py-2.5 tabular-nums">{row.orders}</td>
                  <td className="py-2.5 tabular-nums">{row.covers}</td>
                  <td className="py-2.5 text-right tabular-nums">${row.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] dash-subtle">{state.settings.name} · demo analytics from local store</p>
      </article>
    </div>
  )
}
