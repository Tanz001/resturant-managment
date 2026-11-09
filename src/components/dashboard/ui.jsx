import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown, MoreHorizontal, X } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1]

/* ---------- Dropdown (3-dot / custom trigger) ---------- */

export function Dropdown({ items, trigger, align = 'right', label = 'Actions' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={
          trigger
            ? 'inline-flex items-center'
            : 'dash-icon-btn flex size-8 items-center justify-center rounded-lg'
        }
      >
        {trigger ?? <MoreHorizontal className="size-4" strokeWidth={1.75} />}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: reduce ? 0 : -6, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : -4, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: reduce ? 0.01 : 0.18, ease }}
            className={`dash-menu absolute z-40 mt-1.5 min-w-[180px] overflow-hidden rounded-xl p-1 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, i) =>
              item === 'divider' ? (
                <div key={`d-${i}`} className="my-1 h-px" style={{ background: 'var(--dash-border)' }} />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false)
                    item.onClick?.()
                  }}
                  className={`dash-menu-item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm disabled:opacity-40 ${
                    item.danger ? 'dash-menu-item-danger' : ''
                  }`}
                >
                  {item.icon ? <item.icon className="size-4 shrink-0" strokeWidth={1.75} /> : null}
                  <span className="flex-1">{item.label}</span>
                  {item.hint ? <span className="text-[11px] dash-subtle">{item.hint}</span> : null}
                </button>
              ),
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Select-style dropdown ---------- */

export function SelectMenu({ value, options, onChange, className = '', size = 'md' }) {
  const current = options.find((o) => o.value === value)
  return (
    <Dropdown
      align="left"
      label="Change"
      items={options.map((o) => ({
        label: o.label,
        icon: o.icon,
        onClick: () => onChange(o.value),
        hint: o.value === value ? '✓' : undefined,
      }))}
      trigger={
        <span
          className={`dash-select inline-flex items-center gap-1.5 rounded-lg ${
            size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
          } ${className}`}
        >
          {current?.badge ? (
            <span className={`inline-flex rounded-full px-2 py-0.5 ${current.badge}`}>{current.label}</span>
          ) : (
            current?.label ?? value
          )}
          <ChevronDown className="size-3.5 opacity-70" strokeWidth={2} />
        </span>
      }
    />
  )
}

/** Polished filter trigger with leading icon + chevron menu */
export function FilterSelect({
  value,
  options,
  onChange,
  icon: Icon,
  label = 'Filter',
  className = '',
  minWidth = '11.5rem',
}) {
  const current = options.find((o) => o.value === value) ?? options[0]
  const TriggerIcon = current?.icon ?? Icon
  return (
    <Dropdown
      align="left"
      label={label}
      items={options.map((o) => ({
        label: o.label,
        icon: o.icon,
        onClick: () => onChange(o.value),
        hint: o.count != null ? String(o.count) : o.value === value ? '✓' : undefined,
      }))}
      trigger={
        <span
          className={`dash-filter-trigger group inline-flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm ${className}`}
          style={{ minWidth }}
        >
          {TriggerIcon ? (
            <span className="dash-filter-icon flex size-7 shrink-0 items-center justify-center rounded-lg">
              <TriggerIcon className="size-3.5" strokeWidth={1.85} />
            </span>
          ) : null}
          <span className="min-w-0 flex-1 truncate text-left font-medium">{current?.label ?? label}</span>
          <ChevronDown className="size-4 shrink-0 opacity-55 transition-transform group-aria-expanded:rotate-180" strokeWidth={2} />
        </span>
      }
    />
  )
}

/* ---------- Modal ---------- */

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="dashboard-app-portal fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.2 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: reduce ? 0.01 : 0.28, ease }}
            className={`dash-surface relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl shadow-2xl sm:rounded-2xl ${width}`}
          >
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4" style={{ borderColor: 'var(--dash-border)' }}>
              <div>
                <h2 className="text-base font-semibold">{title}</h2>
                {description ? <p className="mt-0.5 text-xs dash-muted">{description}</p> : null}
              </div>
              <button type="button" onClick={onClose} className="dash-icon-btn rounded-lg p-1.5" aria-label="Close">
                <X className="size-4" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer ? (
              <div className="flex items-center justify-end gap-2 border-t px-5 py-3" style={{ borderColor: 'var(--dash-border)' }}>
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

/* ---------- Drawer (side panel) ---------- */

export function Drawer({ open, onClose, title, description, children, footer }) {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="dashboard-app-portal fixed inset-0 z-[90]">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.2 }}
            className="absolute inset-0 bg-black/40"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: reduce ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduce ? 0 : '100%' }}
            transition={{ duration: reduce ? 0.01 : 0.34, ease }}
            className="dash-surface absolute inset-y-0 right-0 flex w-full max-w-md flex-col shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4" style={{ borderColor: 'var(--dash-border)' }}>
              <div>
                <h2 className="text-base font-semibold">{title}</h2>
                {description ? <p className="mt-0.5 text-xs dash-muted">{description}</p> : null}
              </div>
              <button type="button" onClick={onClose} className="dash-icon-btn rounded-lg p-1.5" aria-label="Close">
                <X className="size-4" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer ? (
              <div className="border-t px-5 py-3" style={{ borderColor: 'var(--dash-border)' }}>
                {footer}
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

/* ---------- Avatar ---------- */

export function Avatar({ src, name = '', size = 'md', className = '' }) {
  const [err, setErr] = useState(false)
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const sz = { xs: 'size-7 text-[10px]', sm: 'size-9 text-xs', md: 'size-11 text-sm', lg: 'size-14 text-base', xl: 'size-20 text-xl' }[size]
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        className={`${sz} shrink-0 rounded-full object-cover ${className}`}
      />
    )
  }
  return (
    <span
      className={`${sz} flex shrink-0 items-center justify-center rounded-full font-semibold ${className}`}
      style={{ background: 'var(--dash-accent-soft)', color: 'var(--dash-accent-text)' }}
    >
      {initials || '?'}
    </span>
  )
}

/* ---------- Form fields ---------- */

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium dash-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-[11px] dash-subtle">{hint}</span> : null}
    </label>
  )
}

export function Input(props) {
  return <input {...props} className={`dash-input h-10 w-full rounded-lg border-0 px-3 text-sm ${props.className ?? ''}`} />
}

export function Textarea(props) {
  return <textarea {...props} className={`dash-input w-full rounded-lg border-0 px-3 py-2 text-sm ${props.className ?? ''}`} />
}

export function NativeSelect({ children, ...props }) {
  return (
    <select {...props} className={`dash-input h-10 w-full rounded-lg border-0 px-3 text-sm ${props.className ?? ''}`}>
      {children}
    </select>
  )
}

/* ---------- Buttons ---------- */

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-11 px-5 text-sm' }[size]
  const variants = {
    primary: 'dash-btn-primary',
    ghost: 'dash-btn-ghost',
    accent: 'dash-btn-accent',
    danger: 'dash-btn-danger',
  }[variant]
  return <button type="button" {...props} className={`${base} ${sizes} ${variants} ${className}`} />
}

/* ---------- Image picker (URL or file -> data URL) ---------- */

export function ImagePicker({ value, onChange, shape = 'rounded-xl', hint = 'Paste an image URL or upload a photo' }) {
  const fileRef = useRef(null)
  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.readAsDataURL(file)
  }
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex size-24 shrink-0 items-center justify-center overflow-hidden ${shape}`}
        style={{ background: 'var(--dash-input)', outline: '1px solid var(--dash-border)' }}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[11px] dash-subtle">No photo</span>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <Input placeholder="https://…" value={value?.startsWith('data:') ? '' : value ?? ''} onChange={(e) => onChange(e.target.value)} />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
            Upload photo
          </Button>
          {value ? (
            <Button variant="ghost" size="sm" onClick={() => onChange('')}>
              Remove
            </Button>
          ) : null}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        </div>
        <p className="text-[11px] dash-subtle">{hint}</p>
      </div>
    </div>
  )
}

/* ---------- Empty state ---------- */

export function EmptyState({ title, description, action }) {
  return (
    <div className="dash-card flex flex-col items-center justify-center px-6 py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-xs dash-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

/* ---------- Toast ---------- */

export function useToast() {
  const [toasts, setToasts] = useState([])
  const push = (message, tone = 'default') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600)
  }
  const view = createPortal(
    <div className="dashboard-app-portal pointer-events-none fixed inset-x-0 bottom-5 z-[95] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease }}
            className={`pointer-events-auto rounded-full px-4 py-2 text-sm shadow-lg ${
              t.tone === 'success' ? 'bg-[#245a4f] text-white' : 'bg-[#141816] text-white'
            }`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
  return { toast: push, ToastView: () => view }
}
