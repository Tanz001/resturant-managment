import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Armchair, ChevronDown, ClipboardList, LogOut, Moon, NotebookPen, Sun } from 'lucide-react'
import { waiterNav } from '../../data/dashboard'
import { useRestaurant, OPEN_STATUSES } from '../../store/RestaurantProvider'
import { useDashboardTheme } from '../../hooks/useDashboardTheme'
import { Avatar, Dropdown } from '../dashboard/ui'

const icons = { NotebookPen, ClipboardList, Armchair }
const WAITER_KEY = 'maison-noir-waiter'

export function useCurrentWaiter() {
  const { state } = useRestaurant()
  const waiters = state.staff.filter((s) => s.role === 'Waiter' && s.active)
  const [id, setId] = useState(() => window.localStorage.getItem(WAITER_KEY) ?? waiters[0]?.id ?? null)
  useEffect(() => {
    if (id) window.localStorage.setItem(WAITER_KEY, id)
  }, [id])
  const waiter = waiters.find((w) => w.id === id) ?? waiters[0] ?? null
  return { waiter, waiters, setWaiterId: setId }
}

export default function WaiterLayout() {
  const { theme, toggleTheme, isLight } = useDashboardTheme()
  const { state } = useRestaurant()
  const { waiter, waiters, setWaiterId } = useCurrentWaiter()
  const myOpen = state.orders.filter((o) => o.waiterId === waiter?.id && OPEN_STATUSES.includes(o.status)).length

  return (
    <div className="dashboard-app flex min-h-dvh flex-col" data-theme={theme}>
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{ background: 'var(--dash-header-bg)', borderColor: 'var(--dash-border)' }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-6">
          <Link to="/waiter" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center font-[family-name:var(--font-dash-serif)] text-sm" style={{ background: 'var(--dash-accent)', color: 'var(--dash-accent-ink)' }}>
              MN
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-tight">Maison Noir</p>
              <p className="text-[11px] dash-muted">Waiter app</p>
            </div>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 md:flex">
            {waiterNav.map((item) => {
              const Icon = icons[item.icon]
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/waiter'}
                  className={({ isActive }) => `dash-nav-link flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? 'is-active font-medium' : ''}`}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                  {item.id === 'mine' && myOpen ? (
                    <span className="rounded-full px-1.5 text-[10px] font-semibold" style={{ background: 'var(--dash-accent)', color: 'var(--dash-accent-ink)' }}>
                      {myOpen}
                    </span>
                  ) : null}
                </NavLink>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={toggleTheme} className="dash-icon-btn rounded-lg p-2" aria-label="Toggle theme">
              {isLight ? <Moon className="size-5" strokeWidth={1.5} /> : <Sun className="size-5" strokeWidth={1.5} />}
            </button>
            <Dropdown
              align="right"
              label="Switch waiter"
              items={[
                ...waiters.map((w) => ({ label: w.name, hint: w.id === waiter?.id ? '✓' : undefined, onClick: () => setWaiterId(w.id) })),
                'divider',
                { label: 'Manager dashboard', icon: LogOut, onClick: () => (window.location.href = '/manager') },
              ]}
              trigger={
                <span className="dash-select flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm">
                  <Avatar src={waiter?.avatar} name={waiter?.name ?? ''} size="xs" />
                  <span className="hidden sm:inline">{waiter?.name?.split(' ')[0] ?? 'Waiter'}</span>
                  <ChevronDown className="size-3.5 opacity-70" />
                </span>
              }
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-24 md:px-6 md:pb-6">
        <Outlet context={{ theme, isLight, waiter }} />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t backdrop-blur-md md:hidden"
        style={{ background: 'var(--dash-header-bg)', borderColor: 'var(--dash-border)' }}
      >
        {waiterNav.map((item) => {
          const Icon = icons[item.icon]
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/waiter'}
              className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[11px] ${isActive ? 'dash-accent-text font-medium' : 'dash-muted'}`}
            >
              <span className="relative">
                <Icon className="size-5" strokeWidth={1.75} />
                {item.id === 'mine' && myOpen ? (
                  <span className="absolute -top-1 -right-2 rounded-full px-1 text-[9px] font-semibold" style={{ background: 'var(--dash-accent)', color: 'var(--dash-accent-ink)' }}>
                    {myOpen}
                  </span>
                ) : null}
              </span>
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
