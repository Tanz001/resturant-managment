import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from './MagneticButton'
import { images } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

const initial = {
  name: '',
  email: '',
  date: '',
  guests: '2',
}

export default function Reservation() {
  const rootRef = useRef(null)
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduce) return
      gsap.fromTo(
        '[data-reserve-reveal]',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 70%',
          },
        },
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setStatus('idle')
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address.'
    }
    if (!form.date) next.date = 'Choose a date.'
    const guests = Number(form.guests)
    if (!guests || guests < 1 || guests > 12) {
      next.guests = 'Guests must be between 1 and 12.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = (event) => {
    event.preventDefault()
    if (!validate()) {
      setStatus('error')
      return
    }
    setStatus('ready')
  }

  return (
    <section
      id="reserve"
      ref={rootRef}
      className="relative overflow-hidden bg-bg px-5 py-28 md:px-10 md:py-36"
    >
      <div className="absolute inset-0">
        <img
          src={images.reserve}
          alt="Table setting at Maison Noir"
          className="h-full w-full object-cover opacity-25"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,247,0.88)_0%,rgba(250,250,247,0.96)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1200px] gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p data-reserve-reveal className="label">
            Reservations
          </p>
          <h2
            data-reserve-reveal
            className="serif mt-5 text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.02em] text-ivory"
          >
            Your table
            <br />
            is waiting.
          </h2>
          <p
            data-reserve-reveal
            className="mt-8 max-w-md text-sm leading-7 text-muted md:text-base"
          >
            An evening worth remembering begins with a reservation.
          </p>
          <div data-reserve-reveal className="mt-10 flex flex-wrap gap-3">
            <MagneticButton
              href={null}
              onClick={() => {
                document.getElementById('reservation-form')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                })
              }}
            >
              Reserve your experience
            </MagneticButton>
            <Link
              to="/menu"
              className="inline-flex h-[3.25rem] items-center px-5 text-[11px] tracking-[0.24em] uppercase text-muted transition-colors hover:text-ivory"
            >
              Browse menu
            </Link>
          </div>
        </div>

        <form
          id="reservation-form"
          data-reserve-reveal
          onSubmit={onSubmit}
          noValidate
          className="border border-line bg-white/80 p-6 shadow-[0_20px_60px_rgba(20,24,22,0.06)] backdrop-blur-sm md:p-8"
        >
          <Field
            label="Name"
            name="name"
            value={form.name}
            onChange={onChange}
            error={errors.name}
            autoComplete="name"
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            error={errors.email}
            autoComplete="email"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={onChange}
              error={errors.date}
            />
            <Field
              label="Guests"
              name="guests"
              type="number"
              min="1"
              max="12"
              value={form.guests}
              onChange={onChange}
              error={errors.guests}
            />
          </div>

          <button
            type="submit"
            className="mt-4 inline-flex h-12 w-full items-center justify-center bg-accent text-[11px] tracking-[0.28em] text-white uppercase transition-opacity hover:opacity-90"
          >
            Request reservation
          </button>

          {status === 'ready' ? (
            <p className="mt-4 text-sm leading-6 text-muted">
              Your request looks complete. This demo has no booking backend —
              please contact the restaurant to confirm your table.
            </p>
          ) : null}
          {status === 'error' ? (
            <p className="mt-4 text-sm text-accent">
              Please correct the highlighted fields.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}

function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  ...rest
}) {
  return (
    <label className="mb-5 block">
      <span className="label text-[10px]">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`mt-2 w-full border-0 border-b bg-transparent py-3 text-sm outline-none transition-colors placeholder:text-muted/50 ${
          error ? 'border-accent' : 'border-line focus:border-accent/60'
        }`}
        {...rest}
      />
      {error ? <span className="mt-2 block text-xs text-accent">{error}</span> : null}
    </label>
  )
}
