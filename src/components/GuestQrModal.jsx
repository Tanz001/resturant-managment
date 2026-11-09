import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Copy, ExternalLink, QrCode, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import TableQrCode from './TableQrCode'
import { guestTableUrl } from '../utils/tableQr'

const DEMO_TABLES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const ease = [0.22, 1, 0.36, 1]

export default function GuestQrModal({ open, onClose, defaultTableId = '4' }) {
  const reduce = useReducedMotion()
  const [tableId, setTableId] = useState(defaultTableId)
  const [copied, setCopied] = useState(false)
  const url = useMemo(() => guestTableUrl(tableId), [tableId])

  useEffect(() => {
    if (!open) return undefined
    setTableId(defaultTableId)
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, defaultTableId])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.2 }}
            className="absolute inset-0 bg-[#141816]/45 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-qr-title"
            initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 16 }}
            transition={{ duration: reduce ? 0.01 : 0.28, ease }}
            className="relative w-full max-w-md overflow-hidden rounded-t-2xl border border-line bg-bg shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <p className="flex items-center gap-2 text-[11px] tracking-[0.2em] text-muted uppercase">
                  <QrCode className="size-3.5" strokeWidth={1.75} /> Guest QR
                </p>
                <h2 id="guest-qr-title" className="serif mt-1 text-2xl tracking-tight text-ivory">
                  Scan to order
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-line p-2 text-muted transition-colors hover:text-ivory"
                aria-label="Close"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div>
                <p className="mb-2 text-[11px] tracking-[0.16em] text-muted uppercase">Table</p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_TABLES.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTableId(id)}
                      className={`min-w-10 rounded-lg px-3 py-2 text-sm tabular-nums transition-colors ${
                        tableId === id
                          ? 'bg-accent text-white'
                          : 'border border-line text-muted hover:text-ivory'
                      }`}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <TableQrCode tableId={tableId} size={200} restaurantName="Maison Noir" />
              </div>

              <div className="rounded-xl border border-line bg-bg-soft px-3 py-2.5">
                <p className="text-[10px] tracking-[0.16em] text-muted uppercase">Guest link</p>
                <p className="mt-1 break-all font-mono text-[11px] text-ivory">{url}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex flex-1 items-center justify-center gap-2 border border-line px-4 py-2.5 text-[11px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-ivory"
                >
                  <Copy className="size-3.5" />
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                <Link
                  to={`/t/${tableId}`}
                  onClick={onClose}
                  className="inline-flex flex-1 items-center justify-center gap-2 bg-accent px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-[#1a433b]"
                >
                  <ExternalLink className="size-3.5" />
                  Open menu
                </Link>
              </div>

              <p className="text-center text-[11px] text-muted">
                Printable QRs also live in Manager → Tables
              </p>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
