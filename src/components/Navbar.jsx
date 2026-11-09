import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Menu, X } from 'lucide-react'
import { navLinks } from '../data/content'
import { scrollToHash } from '../hooks/useLenis'

export default function Navbar({ ready = true, solid = false }) {
  const navRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const onHome = location.pathname === '/'

  useEffect(() => {
    if (!ready) return undefined
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.1 },
      )
    })
    return () => ctx.revert()
  }, [ready])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (link) => (event) => {
    event.preventDefault()
    setOpen(false)

    if (link.type === 'route') {
      navigate(link.href)
      return
    }

    const hash = link.href.includes('#')
      ? `#${link.href.split('#')[1]}`
      : link.href

    if (onHome) {
      scrollToHash(hash)
    } else {
      navigate({ pathname: '/', hash: hash.slice(1) })
    }
  }

  return (
    <>
      <header
        ref={navRef}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid || scrolled || open
            ? 'border-b border-line bg-bg/90 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 md:px-10">
          <Link
            to="/"
            className="serif text-[1.4rem] tracking-[-0.02em] text-[#141816] md:text-[1.55rem]"
            onClick={() => setOpen(false)}
          >
            Maison Noir
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={go(link)}
                className="group relative text-[11px] tracking-[0.22em] text-muted uppercase transition-colors duration-300 hover:text-ivory"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/manager"
              className="hidden text-[11px] tracking-[0.22em] text-muted uppercase transition-colors hover:text-accent md:inline"
            >
              Manager
            </Link>
            <a
              href="/#reserve"
              onClick={go({ href: '/#reserve', type: 'hash' })}
              className="hidden bg-[#245a4f] px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-[#ffffff] uppercase transition-colors hover:bg-[#1a433b] md:inline"
            >
              Reservations
            </a>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center border border-line text-ivory lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-bg transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] lg:hidden ${
          open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex h-full flex-col justify-center gap-8 px-8">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={go(link)}
              className="serif text-5xl tracking-tight text-ivory"
              style={{
                transitionDelay: open ? `${120 + index * 60}ms` : '0ms',
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(20px)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '600ms',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
