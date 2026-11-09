import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Copy, Download, ExternalLink, Printer, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { tableStatusStyles } from '../../data/dashboard'
import { OPEN_STATUSES, orderTotal, useDerived, useRestaurant } from '../../store/RestaurantProvider'
import { printOrderReceipt } from '../../components/dashboard/OrderReceipt'
import { Button, Modal, useToast } from '../../components/dashboard/ui'
import TableQrCode from '../../components/TableQrCode'
import { guestTableUrl } from '../../utils/tableQr'
import { OrderDrawer } from './OrdersPage'

export default function TablesPage() {
  const { state, actions } = useRestaurant()
  const { tableStatus } = useDerived()
  const { toast, ToastView } = useToast()
  const [selected, setSelected] = useState(null)
  const [qrTable, setQrTable] = useState(null)
  const [showAllQr, setShowAllQr] = useState(false)

  const openOrderFor = (tableId) =>
    state.orders.find((o) => o.table === tableId && OPEN_STATUSES.includes(o.status))
  const reservationFor = (tableId) =>
    state.reservations.find(
      (r) => r.table === tableId && (r.status === 'confirmed' || r.status === 'pending'),
    )

  const counts = Object.values(tableStatus).reduce(
    (acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }),
    {},
  )
  const selectedOrder = selected ? state.orders.find((o) => o.id === selected) : null
  const qrUrl = qrTable ? guestTableUrl(qrTable.id) : ''

  const copyLink = async (tableId) => {
    const url = guestTableUrl(tableId)
    try {
      await navigator.clipboard.writeText(url)
      toast('Guest link copied', 'success')
    } catch {
      toast(url)
    }
  }

  const downloadSvg = (tableId) => {
    const svg = document.getElementById(`qr-svg-${tableId}`)
    if (!svg) return
    const data = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `maison-noir-table-${tableId}-qr.svg`
    a.click()
    URL.revokeObjectURL(url)
    toast('QR downloaded')
  }

  const printCard = (table) => {
    const url = guestTableUrl(table.id)
    const name = state.settings.name
    const html = `<!DOCTYPE html><html><head><title>Table ${table.id} QR</title>
<style>
  @page { size: A6; margin: 12mm; }
  body { font-family: Georgia, serif; text-align: center; color: #141816; }
  .card { border: 1px solid #d6d6d0; padding: 28px 20px; border-radius: 12px; }
  h1 { font-size: 28px; margin: 16px 0 4px; letter-spacing: -0.02em; }
  .sub { font-family: system-ui, sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.6; }
  .url { font-family: ui-monospace, monospace; font-size: 10px; margin-top: 14px; word-break: break-all; opacity: 0.55; }
  svg { margin: 0 auto; display: block; }
</style></head><body>
<div class="card">
  <p class="sub">${escapeHtml(name)}</p>
  <div id="qr"></div>
  <h1>Table ${escapeHtml(table.id)}</h1>
  <p class="sub">Scan to view menu & order</p>
  <p class="url">${escapeHtml(url)}</p>
</div>
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js"><\/script>
<script>
  QRCode.toString(${JSON.stringify(url)}, { type: 'svg', margin: 1, width: 220 }, function (err, svg) {
    if (!err) document.getElementById('qr').innerHTML = svg;
    setTimeout(function () { window.print(); }, 200);
  });
<\/script>
</body></html>`
    const win = window.open('', '_blank', 'noopener,noreferrer,width=480,height=640')
    if (!win) {
      toast('Allow popups to print QR cards')
      return
    }
    win.document.write(html)
    win.document.close()
  }

  const sortedTables = useMemo(
    () => [...state.tables].sort((a, b) => Number(a.id) - Number(b.id)),
    [state.tables],
  )

  return (
    <div className="space-y-5">
      <ToastView />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4 text-sm dash-muted">
          <span>
            <span className="dash-badge-emerald rounded-full px-2 py-0.5 text-[11px]">Free</span>{' '}
            {counts.free ?? 0}
          </span>
          <span>
            <span className="dash-badge-gold rounded-full px-2 py-0.5 text-[11px]">Occupied</span>{' '}
            {counts.occupied ?? 0}
          </span>
          <span>
            <span className="dash-badge-sky rounded-full px-2 py-0.5 text-[11px]">Reserved</span>{' '}
            {counts.reserved ?? 0}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setShowAllQr(true)}>
            <QrCode className="size-4" /> All QR codes
          </Button>
        </div>
      </div>

      <p className="text-xs dash-subtle">
        Each table has a guest link. Guests scan the QR, open the menu, and send orders straight to the kitchen.
        Demo: <Link className="dash-accent underline-offset-2 hover:underline" to="/t/4">/t/4</Link>
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {sortedTables.map((table) => {
          const status = tableStatus[table.id]
          const st = tableStatusStyles[status]
          const order = openOrderFor(table.id)
          const res = reservationFor(table.id)
          return (
            <motion.div
              key={table.id}
              whileHover={{ y: -3 }}
              className={`dash-card relative p-4 text-left ${st.className}`}
            >
              <button
                type="button"
                className={`w-full text-left ${order ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => order && setSelected(order.id)}
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs opacity-80">Table</p>
                  <span className="text-[10px] font-medium uppercase tracking-wide">{st.label}</span>
                </div>
                <p className="mt-1 font-[family-name:var(--font-dash-serif)] text-3xl">{table.id}</p>
                <p className="mt-3 text-xs opacity-80">{table.seats} seats</p>
                {order ? (
                  <p className="mt-1 truncate text-xs">
                    #{order.id} · {order.customerName || order.waiterName} · ${orderTotal(order)}
                  </p>
                ) : res ? (
                  <p className="mt-1 truncate text-xs">
                    {res.time} · {res.name}
                  </p>
                ) : (
                  <p className="mt-1 text-xs opacity-60">Ready to seat</p>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setQrTable(table)
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-black/5 px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-black/10"
                style={{ color: 'inherit' }}
              >
                <QrCode className="size-3.5" /> QR / link
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Single table QR modal */}
      <Modal
        open={Boolean(qrTable)}
        onClose={() => setQrTable(null)}
        title={qrTable ? `Table ${qrTable.id} QR` : ''}
        description="Guests scan this to open the menu and place an order."
        size="sm"
        footer={
          qrTable ? (
            <div className="flex w-full flex-wrap gap-2">
              <Button variant="ghost" onClick={() => copyLink(qrTable.id)}>
                <Copy className="size-4" /> Copy link
              </Button>
              <Button variant="ghost" onClick={() => downloadSvg(qrTable.id)}>
                <Download className="size-4" /> SVG
              </Button>
              <Button variant="ghost" onClick={() => printCard(qrTable)}>
                <Printer className="size-4" /> Print
              </Button>
              <Link to={`/t/${qrTable.id}`} target="_blank" rel="noreferrer" className="ml-auto">
                <Button>
                  <ExternalLink className="size-4" /> Open guest view
                </Button>
              </Link>
            </div>
          ) : null
        }
      >
        {qrTable ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <QRCodeSVG
                id={`qr-svg-${qrTable.id}`}
                value={qrUrl}
                size={200}
                level="M"
                bgColor="#ffffff"
                fgColor="#141816"
              />
            </div>
            <p className="max-w-xs break-all text-center text-[11px] dash-muted">{qrUrl}</p>
          </div>
        ) : null}
      </Modal>

      {/* All QR sheet */}
      <Modal
        open={showAllQr}
        onClose={() => setShowAllQr(false)}
        title="Table QR codes"
        description="Print this sheet for table tents. Each code opens that table’s guest menu."
        size="xl"
        footer={
          <Button
            onClick={() => {
              window.print()
            }}
          >
            <Printer className="size-4" /> Print sheet
          </Button>
        }
      >
        <div className="qr-print-sheet grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedTables.map((t) => (
            <div
              key={t.id}
              className="flex flex-col items-center rounded-2xl border p-5"
              style={{ borderColor: 'var(--dash-border)' }}
            >
              <TableQrCode
                tableId={t.id}
                size={140}
                restaurantName={state.settings.name}
              />
              <button
                type="button"
                className="mt-3 text-[11px] dash-accent hover:underline"
                onClick={() => copyLink(t.id)}
              >
                Copy link
              </button>
            </div>
          ))}
        </div>
      </Modal>

      <OrderDrawer
        order={selectedOrder}
        waiter={selectedOrder ? state.staff.find((s) => s.id === selectedOrder.waiterId) : null}
        restaurant={state.settings}
        onClose={() => setSelected(null)}
        onStatus={(s) => selectedOrder && actions.setOrderStatus(selectedOrder.id, s)}
        onPrint={() =>
          selectedOrder &&
          printOrderReceipt(selectedOrder, {
            restaurant: state.settings,
            waiter: state.staff.find((s) => s.id === selectedOrder.waiterId),
          })
        }
      />
    </div>
  )
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
