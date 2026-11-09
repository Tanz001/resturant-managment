/** Absolute guest ordering URL for a table (used in QR codes). */
export function guestTableUrl(tableId, origin = window.location.origin) {
  const base = String(origin).replace(/\/$/, '')
  return `${base}/t/${encodeURIComponent(tableId)}`
}

export function guestOrderUrl(tableId, orderId, origin = window.location.origin) {
  const base = String(origin).replace(/\/$/, '')
  return `${base}/t/${encodeURIComponent(tableId)}/order/${encodeURIComponent(orderId)}`
}
