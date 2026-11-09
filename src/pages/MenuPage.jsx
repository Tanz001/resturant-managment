import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Search } from 'lucide-react'
import { useLenis } from '../hooks/useLenis'
import CustomCursor from '../components/CustomCursor'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MagneticButton from '../components/MagneticButton'
import {
  fullMenu,
  images,
  itemsInMenuCategory,
  menuCategories,
} from '../data/content'

const ease = [0.22, 1, 0.36, 1]

export default function MenuPage() {
  useLenis(true)
  const reduce = useReducedMotion()
  const [active, setActive] = useState(menuCategories[0]?.id ?? '')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return fullMenu.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tag?.toLowerCase().includes(q),
    )
  }, [query])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (filtered) return undefined
    const nodes = menuCategories
      .map((c) => document.getElementById(`menu-${c.id}`))
      .filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) {
          setActive(visible.target.id.replace('menu-', ''))
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.25] },
    )
    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [filtered])

  const jump = (id) => {
    setActive(id)
    setQuery('')
    document.getElementById(`menu-${id}`)?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <CustomCursor />
      <Navbar ready solid />

      <main className="site-shell min-h-dvh text-ivory">
        <header className="relative overflow-hidden border-b border-line">
          <div className="absolute inset-0">
            <img
              src={images.menuHero}
              alt=""
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,247,0.72)_0%,rgba(250,250,247,0.92)_70%,#fafaf7_100%)]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 pt-28 pb-12 md:px-8 md:pt-32 md:pb-14">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0.01 : 0.5, ease }}
            >
              <p className="text-[11px] tracking-[0.28em] text-accent uppercase">
                Dinner service
              </p>
              <h1 className="serif mt-3 text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.92] tracking-tight">
                Menu
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-muted md:text-base">
                Browse tonight&apos;s kitchen. When you are ready, reserve a
                table — our floor team handles the rest.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <MagneticButton href="/#reserve">Reserve a table</MagneticButton>
                <Link
                  to="/"
                  className="inline-flex h-12 items-center px-4 text-[11px] tracking-[0.22em] text-muted uppercase transition-colors hover:text-ivory"
                >
                  ← Home
                </Link>
              </div>
            </motion.div>
          </div>
        </header>

        <div className="sticky top-20 z-30 border-b border-line bg-bg/94 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-5 py-3 md:px-8 md:py-4">
            <label className="relative mb-3 block">
              <Search
                className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted"
                strokeWidth={1.5}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes…"
                className="w-full border-0 border-b border-line bg-transparent py-2.5 pr-2 pl-7 text-sm text-ivory outline-none placeholder:text-muted/65 focus:border-accent"
                aria-label="Search menu"
              />
            </label>

            {!filtered ? (
              <nav
                aria-label="Categories"
                className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {menuCategories.map((cat) => {
                  const isActive = active === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => jump(cat.id)}
                      className={`relative shrink-0 px-3.5 py-2 text-[11px] tracking-[0.16em] uppercase transition-colors sm:px-4 ${
                        isActive ? 'text-white' : 'text-muted hover:text-ivory'
                      }`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId={reduce ? undefined : 'menu-cat-pill'}
                          className="absolute inset-0 bg-accent"
                          transition={{ duration: 0.28, ease }}
                        />
                      ) : (
                        <span className="absolute inset-0 ring-1 ring-line" />
                      )}
                      <span className="relative z-10">{cat.name}</span>
                    </button>
                  )
                })}
              </nav>
            ) : (
              <p className="py-1.5 text-[11px] tracking-[0.18em] text-accent uppercase">
                {filtered.length} result{filtered.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
          {filtered ? (
            <DishGrid items={filtered} reduce={reduce} />
          ) : (
            menuCategories.map((cat, catIndex) => {
              const items = itemsInMenuCategory(cat.id)
              return (
                <section
                  key={cat.id}
                  id={`menu-${cat.id}`}
                  className="scroll-mt-48 pb-14 md:pb-16"
                >
                  <div className="mb-6 flex flex-col gap-1 border-b border-accent/25 pb-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] tracking-[0.28em] text-accent uppercase">
                        {String(catIndex + 1).padStart(2, '0')}
                      </p>
                      <h2 className="serif mt-1 text-3xl tracking-tight md:text-4xl">
                        {cat.name}
                      </h2>
                    </div>
                    <p className="text-sm text-muted">{cat.hint}</p>
                  </div>
                  <DishGrid items={items} reduce={reduce} />
                </section>
              )
            })
          )}

          <div className="mt-4 border border-line bg-white px-6 py-12 text-center shadow-[0_16px_40px_rgba(20,24,22,0.04)] md:px-10 md:py-14">
            <p className="text-[11px] tracking-[0.28em] text-accent uppercase">
              Reservations
            </p>
            <p className="serif mt-3 text-3xl tracking-tight md:text-4xl">
              Ready to dine?
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              Reserve your table and we will confirm by email.
            </p>
            <div className="mt-8 flex justify-center">
              <MagneticButton href="/#reserve">Reserve a table</MagneticButton>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

function DishGrid({ items, reduce }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
      {items.map((item, index) => (
        <motion.li
          key={item.id}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{
            duration: 0.35,
            delay: reduce ? 0 : Math.min(index, 6) * 0.03,
            ease,
          }}
          className="group flex flex-col overflow-hidden border border-line bg-white transition-colors hover:border-accent/35"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-bg-soft">
            {item.image ? (
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover motion-safe:transition motion-safe:duration-700 motion-safe:group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="serif text-4xl text-accent/30">
                  {item.name.charAt(0)}
                </span>
              </div>
            )}
            {item.tag ? (
              <span className="absolute top-3 left-3 bg-bg/85 px-2.5 py-1 text-[10px] tracking-[0.18em] text-accent uppercase backdrop-blur-sm">
                {item.tag}
              </span>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="serif text-xl tracking-tight text-ivory md:text-[1.35rem]">
                {item.name}
              </h3>
              <p className="shrink-0 pt-1 text-sm tabular-nums text-accent">
                ${item.price}
              </p>
            </div>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted">
              {item.description}
            </p>
          </div>
        </motion.li>
      ))}
    </ul>
  )
}
