import { QRCodeSVG } from 'qrcode.react'
import { guestTableUrl } from '../utils/tableQr'

export default function TableQrCode({
  tableId,
  size = 160,
  restaurantName = 'Maison Noir',
  showLabel = true,
  className = '',
}) {
  const url = guestTableUrl(tableId)

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#141816"
        />
      </div>
      {showLabel ? (
        <div className="mt-3 text-center">
          <p className="font-[family-name:var(--font-dash-serif)] text-lg leading-none tracking-tight">
            Table {tableId}
          </p>
          <p className="mt-1 text-[10px] tracking-[0.18em] uppercase opacity-60">
            {restaurantName} · Scan to order
          </p>
        </div>
      ) : null}
    </div>
  )
}
