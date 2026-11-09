import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Armchair,
  Bell,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  Menu,
  Moon,
  NotebookPen,
  Search,
  Settings,
  Sun,
  UtensilsCrossed,
  Users,
  X,
} from 'lucide-react'
import { managerNav } from '../../data/dashboard'
import { useDashboardTheme } from '../../hooks/useDashboardTheme'

const icons = {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  BookOpen,
  Armchair,
  Users,
  Settings,
}

const titles = {
  '/manager': 'Overview',
  '/manager/orders': 'Orders',
  '/manager/reservations': 'Reservations',
  '/manager/menu': 'Menu',
  '/manager/tables': 'Tables',
  '/manager/staff': 'Staff',
  '/manager/settings': 'Settings',
}

export default function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme, isLight } = useDashboardTheme()
  const location = useLocation()
  const title = titles[location.pathname] ?? 'Manager'

  return (
    <div className="dashboard-app min-h-dvh" data-theme={theme}>
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'var(--dash-overlay)' }}
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--dash-bg-elevated)',
          borderColor: 'var(--dash-border)',
        }}
      >
        <div
          className="flex h-16 items-center justify-between border-b px-5"
          style={{ borderColor: 'var(--dash-border)' }}
        >
          <Link to="/manager" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span
              className="flex size-9 items-center justify-center font-[family-name:var(--font-dash-serif)] text-sm"
              style={{ background: 'var(--dash-accent)', color: 'var(--dash-accent-ink)' }}
            >
              MN
            </span>
            <div>
              <p className="text-sm font-medium tracking-wide">Maison Noir</p>
              <p className="text-[11px] dash-muted">Manager</p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-md p-2 dash-muted lg:hidden"
            style={{ background: 'transparent' }}
            onClick={() => setOpen(false)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--dash-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
            aria-label="Close sidebar"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] tracking-[0.22em] uppercase dash-subtle">
            Operations
          </p>
          {managerNav.map((item) => {
            const Icon = icons[item.icon]
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/manager'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `dash-nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive ? 'is-active font-medium' : ''
                  }`
                }
              >
                {Icon ? <Icon className="size-[18px] shrink-0" strokeWidth={1.5} /> : null}
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t p-4" style={{ borderColor: 'var(--dash-border)' }}>
          <Link
            to="/waiter"
            className="dash-nav-link mb-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
          >
            <NotebookPen className="size-[18px] shrink-0" strokeWidth={1.5} />
            Waiter app
            <span className="ml-auto text-[10px] dash-subtle">↗</span>
          </Link>
          <div
            className="rounded-xl p-3"
            style={{
              background: 'var(--dash-surface-soft)',
              boxShadow: 'inset 0 0 0 1px var(--dash-border)',
            }}
          >
            <p className="text-sm font-medium">Camille Roux</p>
            <p className="mt-0.5 text-xs dash-muted">General Manager</p>
            <Link to="/" className="mt-3 inline-flex text-xs tracking-wide dash-accent hover:opacity-80">
              View guest site →
            </Link>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header
          className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-md md:px-6"
          style={{
            background: 'var(--dash-header-bg)',
            borderColor: 'var(--dash-border)',
          }}
        >
          <button
            type="button"
            className="rounded-md p-2 dash-soft lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-medium md:text-lg">{title}</h1>
            <p className="hidden text-xs dash-muted sm:block">
              {new Date().toLocaleDateString(undefined, { weekday: 'long' })} service · Live floor
            </p>
          </div>

          <label className="relative hidden max-w-xs flex-1 md:block">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 dash-subtle"
              strokeWidth={1.5}
            />
            <input
              type="search"
              placeholder="Search orders, guests…"
              className="dash-input h-10 w-full rounded-lg border-0 pr-3 pl-10 text-sm outline-none placeholder:opacity-60"
            />
          </label>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 dash-soft transition-colors"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--dash-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
            aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            title={isLight ? 'Dark mode' : 'Light mode'}
          >
            {isLight ? (
              <Moon className="size-5" strokeWidth={1.5} />
            ) : (
              <Sun className="size-5" strokeWidth={1.5} />
            )}
          </button>

          <button
            type="button"
            className="relative rounded-lg p-2 dash-soft"
            aria-label="Notifications"
          >
            <Bell className="size-5" strokeWidth={1.5} />
            <span
              className="absolute top-1.5 right-1.5 size-2 rounded-full"
              style={{ background: 'var(--dash-accent)' }}
            />
          </button>
        </header>

        <div className="px-4 py-5 md:px-6 md:py-6">
          <Outlet context={{ theme, isLight }} />
        </div>
      </div>
    </div>
  )
}
