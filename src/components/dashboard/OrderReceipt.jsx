import { orderTotal } from '../../store/RestaurantProvider'

/** Opens a polished printable receipt in a new window. */
export function printOrderReceipt(order, { restaurant, waiter } = {}) {
  if (!order || typeof window === 'undefined') return

  const settings = restaurant ?? {
    name: 'Maison Noir',
    address: '18 Rue des Ombres, 75006 Paris',
    hours: 'Tue–Sat · 18:00–23:00',
    phone: '+33 1 00 00 00 00',
  }

  const subtotal = orderTotal(order)
  const service = Math.round(subtotal * 0.125)
  const total = subtotal + service
  const when = new Date(order.createdAt)
  const dateStr = when.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = when.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })

  const waiterName = waiter?.name ?? order.waiterName ?? '—'
  const customer = order.customerName?.trim() || 'Walk-in guest'

  const lines = order.items
    .map(
      (it) => `
      <tr>
        <td class="item">
          <div class="item-name">${escapeHtml(it.name)}</div>
          ${it.notes ? `<div class="item-note">${escapeHtml(it.notes)}</div>` : ''}
        </td>
        <td class="qty">${it.qty}</td>
        <td class="price">$${(it.price * it.qty).toFixed(2)}</td>
      </tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Receipt · Order #${escapeHtml(order.id)} · ${escapeHtml(settings.name)}</title>
  <style>
    @page { size: 80mm auto; margin: 6mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Courier New", Courier, ui-monospace, monospace;
      color: #141816;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      width: 72mm;
      margin: 0 auto;
      padding: 4mm 0 8mm;
    }
    .brand {
      text-align: center;
      border-bottom: 1.5px dashed #141816;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .brand-mark {
      display: inline-block;
      border: 1.5px solid #141816;
      padding: 4px 10px;
      letter-spacing: 0.28em;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .brand h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-top: 10px;
    }
    .brand .tagline {
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      margin-top: 4px;
      opacity: 0.7;
    }
    .brand .addr {
      font-size: 10px;
      line-height: 1.45;
      margin-top: 8px;
      opacity: 0.75;
    }
    .meta {
      font-size: 11px;
      line-height: 1.55;
      margin-bottom: 12px;
    }
    .meta .row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .meta .label { opacity: 0.65; }
    .meta .value { font-weight: 600; text-align: right; }
    .divider {
      border: none;
      border-top: 1.5px dashed #141816;
      margin: 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    thead th {
      text-align: left;
      font-size: 9px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      opacity: 0.55;
      padding-bottom: 6px;
      border-bottom: 1px solid #d6d6d0;
    }
    thead th.qty, thead th.price, td.qty, td.price { text-align: right; }
    thead th.qty, td.qty { width: 28px; }
    thead th.price, td.price { width: 52px; }
    tbody td {
      padding: 8px 0;
      vertical-align: top;
      border-bottom: 1px dotted #cfcfc8;
    }
    .item-name { font-weight: 600; }
    .item-note {
      font-size: 10px;
      opacity: 0.65;
      font-style: italic;
      margin-top: 2px;
    }
    .totals {
      margin-top: 4px;
      font-size: 11px;
    }
    .totals .row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
    }
    .totals .row.muted { opacity: 0.7; }
    .totals .row.grand {
      border-top: 1.5px solid #141816;
      margin-top: 6px;
      padding-top: 8px;
      font-size: 14px;
      font-weight: 700;
    }
    .footer {
      text-align: center;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1.5px dashed #141816;
    }
    .footer .thanks {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 15px;
      font-style: italic;
    }
    .footer .small {
      font-size: 10px;
      opacity: 0.65;
      margin-top: 6px;
      line-height: 1.4;
    }
    .barcode {
      margin: 14px auto 0;
      width: 70%;
      height: 28px;
      background:
        repeating-linear-gradient(
          90deg,
          #141816 0 1.5px,
          transparent 1.5px 3.5px,
          #141816 3.5px 4.5px,
          transparent 4.5px 7px,
          #141816 7px 10px,
          transparent 10px 12px
        );
      opacity: 0.85;
    }
    .order-no {
      text-align: center;
      font-size: 10px;
      letter-spacing: 0.22em;
      margin-top: 6px;
      opacity: 0.65;
    }
    @media screen {
      body { background: #eceae4; padding: 24px; }
      .sheet {
        background: #fff;
        padding: 18px 16px 22px;
        box-shadow: 0 12px 40px rgba(20, 24, 22, 0.18);
        border-radius: 4px;
      }
      .print-hint {
        text-align: center;
        font-family: system-ui, sans-serif;
        font-size: 12px;
        color: #5f6863;
        margin-bottom: 12px;
      }
    }
  </style>
</head>
<body>
  <p class="print-hint">Printing… close this window when done.</p>
  <div class="sheet">
    <header class="brand">
      <div class="brand-mark">MN</div>
      <h1>${escapeHtml(settings.name)}</h1>
      <p class="tagline">An Art of Taste</p>
      <p class="addr">
        ${escapeHtml(settings.address)}<br />
        ${escapeHtml(settings.phone ?? '+33 1 00 00 00 00')}<br />
        ${escapeHtml(settings.hours ?? '')}
      </p>
    </header>

    <section class="meta">
      <div class="row"><span class="label">Order</span><span class="value">#${escapeHtml(order.id)}</span></div>
      <div class="row"><span class="label">Date</span><span class="value">${escapeHtml(dateStr)}</span></div>
      <div class="row"><span class="label">Time</span><span class="value">${escapeHtml(timeStr)}</span></div>
      <div class="row"><span class="label">Table</span><span class="value">${escapeHtml(String(order.table))} · ${order.guests ?? 1} guests</span></div>
      <div class="row"><span class="label">Guest</span><span class="value">${escapeHtml(customer)}</span></div>
      <div class="row"><span class="label">Server</span><span class="value">${escapeHtml(waiterName)}</span></div>
    </section>

    <hr class="divider" />

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="qty">Qty</th>
          <th class="price">Amt</th>
        </tr>
      </thead>
      <tbody>
        ${lines}
      </tbody>
    </table>

    <div class="totals">
      <div class="row muted"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
      <div class="row muted"><span>Service 12.5%</span><span>$${service.toFixed(2)}</span></div>
      <div class="row grand"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    </div>

    ${
      order.notes
        ? `<hr class="divider" /><p style="font-size:10px;opacity:.75"><strong>Note:</strong> ${escapeHtml(order.notes)}</p>`
        : ''
    }

    <footer class="footer">
      <p class="thanks">Thank you for dining with us.</p>
      <p class="small">Please keep this receipt for your records.<br />We look forward to welcoming you again.</p>
      <div class="barcode" aria-hidden="true"></div>
      <p class="order-no">#${escapeHtml(order.id)}</p>
    </footer>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () {
        window.focus();
        window.print();
      }, 180);
    };
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'noopener,noreferrer,width=420,height=720')
  if (!win) {
    // Fallback: blob URL if popup blocked
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
