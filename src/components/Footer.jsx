import { Link, useNavigate } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { navLinks } from '../data/content'
import { scrollToHash } from '../hooks/useLenis'

export default function Footer() {
  const navigate = useNavigate()

  const go = (link) => (event) => {
    event.preventDefault()
    if (link.type === 'route') {
      navigate(link.href)
      return
    }
    const hash = link.href.includes('#')
      ? `#${link.href.split('#')[1]}`
      : link.href
    if (window.location.pathname === '/') {
      scrollToHash(hash)
    } else {
      navigate({ pathname: '/', hash: hash.slice(1) })
    }
  }

  return (
    <footer className="border-t border-line bg-bg-soft px-5 pt-20 pb-10 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <p className="serif text-[clamp(2.2rem,6vw,5rem)] leading-[0.95] tracking-[-0.02em] text-ivory">
          We look forward to welcoming you.
        </p>

        <div className="mt-16 grid gap-12 border-t border-line pt-12 md:grid-cols-4">
          <div>
            <p className="serif text-xl tracking-[0.16em] uppercase">Maison Noir</p>
            <p className="mt-4 text-sm leading-7 text-muted">An Art of Taste.</p>
          </div>

          <div>
            <p className="label">Visit</p>
            <p className="mt-4 text-sm leading-7 text-muted">
              18 Rue des Ombres
              <br />
              75006 Paris, France
            </p>
          </div>

          <div>
            <p className="label">Hours</p>
            <p className="mt-4 text-sm leading-7 text-muted">
              Tue — Sat
              <br />
              18:00 — 23:00
            </p>
            <p className="mt-4 text-sm leading-7 text-muted">
              reservations@maisonnoir.example
              <br />
              +33 1 00 00 00 00
            </p>
          </div>

          <div>
            <p className="label">For guests</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={go(link)} className="hover:text-ivory">
                  {link.label}
                </a>
              ))}
              <Link to="/menu" className="hover:text-ivory">
                Full menu
              </Link>
              <Link to="/manager" className="hover:text-ivory">
                Manager dashboard
              </Link>
              <Link to="/waiter" className="hover:text-ivory">
                Waiter app
              </Link>
              <Link to="/t/4" className="hover:text-ivory">
                Guest QR demo (Table 4)
              </Link>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ivory"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-line pt-8 text-xs tracking-[0.18em] uppercase text-muted">
          <p>© {new Date().getFullYear()} Maison Noir</p>
          <button
            type="button"
            onClick={() => {
              if (window.location.pathname === '/') {
                scrollToHash('#top')
              } else {
                navigate('/')
              }
            }}
            className="inline-flex items-center gap-2 text-ivory transition-colors hover:text-accent"
          >
            Back to top
            <ArrowUp size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </footer>
  )
}
