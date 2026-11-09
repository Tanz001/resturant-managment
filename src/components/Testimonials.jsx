import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useReducedMotion,
} from 'motion/react'
import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react'
import { testimonials } from '../data/content'

const ease = [0.22, 1, 0.36, 1]
const AUTO_MS = 6500

export default function Testimonials() {
  const reduce = useReducedMotion()
  const rootRef = useRef(null)
  const inView = useInView(rootRef, { once: true, margin: '-15% 0px' })

  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)
  const [cycle, setCycle] = useState(0)

  const go = (next, direction) => {
    setDir(direction)
    setIndex((next + testimonials.length) % testimonials.length)
    setCycle((c) => c + 1)
  }

  useEffect(() => {
    if (paused || !inView) return undefined
    const id = setTimeout(() => go(index + 1, 1), AUTO_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, inView, cycle])

  const current = testimonials[index]
  const d = (s) => (reduce ? 0.01 : s)

  return (
    <section
      id="voices"
      ref={rootRef}
      className="relative overflow-hidden bg-[#fafaf7] py-28 md:py-36"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="hero-blob hero-blob-b absolute -top-40 right-[-10%] size-[34rem] rounded-full bg-[#245a4f]/10 blur-3xl" />
        <div className="hero-blob hero-blob-a absolute bottom-[-10rem] left-[-8%] size-[30rem] rounded-full bg-[#e8c9a0]/35 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Header */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: d(0.6), ease }}
              className="text-[11px] font-medium tracking-[0.28em] text-[#245a4f] uppercase"
            >
              Guest voices
            </motion.p>
            <h2 className="serif mt-5 text-[clamp(2.6rem,6vw,5.25rem)] leading-[0.98] tracking-[-0.03em] text-[#141816]">
              <RevealWords inView={inView} reduce={reduce} text="What our guests" />
              <br />
              <RevealWords
                inView={inView}
                reduce={reduce}
                text="remember most."
                delay={0.25}
                accentLast
              />
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: d(0.7), ease, delay: d(0.3) }}
            className="flex items-center gap-6 lg:col-span-5 lg:justify-end"
          >
            <div className="text-right">
              <p className="serif text-6xl leading-none tracking-tight text-[#141816] tabular-nums md:text-7xl">
                <CountUp to={4.9} inView={inView} reduce={reduce} decimals={1} />
              </p>
              <div className="mt-2 flex justify-end gap-1 text-[#245a4f]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={inView ? { scale: 1, rotate: 0 } : {}}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 18,
                      delay: reduce ? 0 : 0.6 + i * 0.08,
                    }}
                  >
                    <Star className="size-4 fill-current" strokeWidth={0} />
                  </motion.span>
                ))}
              </div>
              <p className="mt-2 text-sm text-[#4a524d]">
                from <CountUp to={2400} inView={inView} reduce={reduce} /> verified guests
              </p>
            </div>
            <AvatarStack />
          </motion.div>
        </div>

        {/* Featured carousel */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: d(0.8), ease, delay: d(0.35) }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative mt-16 grid gap-6 lg:mt-20 lg:grid-cols-12"
        >
          {/* Big quote card */}
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_30px_80px_-40px_rgba(20,24,22,0.35)] ring-1 ring-[#141816]/6 md:p-10 lg:col-span-8">
            <Quote
              className="absolute -top-4 -right-2 size-40 text-[#245a4f]/6"
              strokeWidth={1}
              aria-hidden="true"
            />

            <div className="relative min-h-[260px] md:min-h-[240px]">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.figure
                  key={current.id}
                  custom={dir}
                  variants={{
                    enter: (direction) => ({
                      opacity: 0,
                      x: reduce ? 0 : direction * 48,
                      filter: reduce ? 'none' : 'blur(6px)',
                    }),
                    center: {
                      opacity: 1,
                      x: 0,
                      filter: 'blur(0px)',
                      transition: { duration: d(0.6), ease },
                    },
                    exit: (direction) => ({
                      opacity: 0,
                      x: reduce ? 0 : direction * -48,
                      filter: reduce ? 'none' : 'blur(6px)',
                      transition: { duration: d(0.35), ease },
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag={reduce ? false : 'x'}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70) go(index + 1, 1)
                    else if (info.offset.x > 70) go(index - 1, -1)
                  }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <div className="flex gap-1 text-[#245a4f]">
                    {Array.from({ length: current.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="serif mt-6 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.25] tracking-[-0.01em] text-[#141816]">
                    “{current.quote}”
                  </blockquote>
                  <figcaption className="mt-8 flex items-center gap-4">
                    <img
                      src={current.avatar}
                      alt={current.name}
                      className="size-12 rounded-full object-cover ring-2 ring-white"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-[#141816]">{current.name}</p>
                      <p className="text-sm text-[#4a524d]">{current.role}</p>
                    </div>
                    <span className="ml-auto hidden rounded-full bg-[#245a4f]/8 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-[#245a4f] uppercase sm:inline-flex">
                      {current.dish}
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#141816]/8 pt-6">
              <div className="flex gap-2">
                {testimonials.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-label={`Show review ${i + 1}`}
                    onClick={() => go(i, i > index ? 1 : -1)}
                    className="relative h-1.5 overflow-hidden rounded-full bg-[#141816]/10 transition-all"
                    style={{ width: i === index ? 48 : 12 }}
                  >
                    {i === index ? (
                      <motion.span
                        key={`${cycle}-${paused}`}
                        initial={{ x: '-100%' }}
                        animate={paused ? { x: '-100%' } : { x: 0 }}
                        transition={{
                          duration: reduce ? 0 : AUTO_MS / 1000,
                          ease: 'linear',
                        }}
                        className="absolute inset-0 rounded-full bg-[#245a4f]"
                      />
                    ) : null}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <NavButton onClick={() => go(index - 1, -1)} label="Previous review">
                  <ArrowLeft className="size-4" strokeWidth={2} />
                </NavButton>
                <NavButton onClick={() => go(index + 1, 1)} label="Next review">
                  <ArrowRight className="size-4" strokeWidth={2} />
                </NavButton>
              </div>
            </div>
          </div>

          {/* Side: next-up list */}
          <div className="grid gap-4 lg:col-span-4">
            {[1, 2].map((offset) => {
              const t = testimonials[(index + offset) % testimonials.length]
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  layout
                  onClick={() => go((index + offset) % testimonials.length, 1)}
                  whileHover={reduce ? undefined : { y: -4 }}
                  transition={{ duration: d(0.45), ease }}
                  className="group flex items-start gap-4 rounded-[1.5rem] bg-white/70 p-5 text-left ring-1 ring-[#141816]/6 backdrop-blur-sm transition-colors hover:bg-white hover:shadow-[0_20px_50px_-30px_rgba(20,24,22,0.4)]"
                >
                  <img
                    src={t.avatar}
                    alt=""
                    className="size-11 shrink-0 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-3 text-sm leading-6 text-[#4a524d]">
                      “{t.quote}”
                    </p>
                    <p className="mt-3 text-sm font-semibold text-[#141816]">
                      {t.name}
                      <span className="ml-2 font-normal text-[#4a524d]">{t.dish}</span>
                    </p>
                  </div>
                  <ArrowRight
                    className="ml-auto size-4 shrink-0 text-[#245a4f] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                    strokeWidth={2}
                  />
                </motion.button>
              )
            })}
            <div className="rounded-[1.5rem] bg-[#245a4f] p-6 text-white">
              <p className="text-[11px] font-medium tracking-[0.2em] text-white/70 uppercase">
                Tonight
              </p>
              <p className="serif mt-2 text-2xl leading-tight">
                A few tables remain for 20:30.
              </p>
              <a
                href="#reserve"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline"
              >
                Reserve now <ArrowRight className="size-4" strokeWidth={2} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Marquee rows */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: d(0.8), delay: d(0.6) }}
        className="relative mt-16 space-y-4 lg:mt-20 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
      >
        <MarqueeRow items={testimonials} speed={46} />
        <MarqueeRow items={[...testimonials].reverse()} speed={56} reverse />
      </motion.div>
    </section>
  )
}

function RevealWords({ text, inView, reduce, delay = 0, accentLast = false }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
          <motion.span
            initial={{ y: reduce ? 0 : '110%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{
              duration: reduce ? 0.01 : 0.9,
              ease,
              delay: reduce ? 0 : delay + i * 0.08,
            }}
            className={`inline-block ${
              accentLast && i === words.length - 1 ? 'italic font-light text-[#245a4f]' : ''
            }`}
          >
            {w}
            {'\u00A0'}
          </motion.span>
        </span>
      ))}
    </>
  )
}

function CountUp({ to, inView, reduce, decimals = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!inView || !ref.current) return undefined
    if (reduce) {
      ref.current.textContent = to.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
      return undefined
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = v.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        }
      },
    })
    return () => controls.stop()
  }, [inView, to, reduce, decimals])
  return <span ref={ref}>0</span>
}

function AvatarStack() {
  return (
    <div className="hidden -space-x-3 sm:flex">
      {testimonials.slice(0, 4).map((t, i) => (
        <motion.img
          key={t.id}
          src={t.avatar}
          alt=""
          loading="lazy"
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.5 + i * 0.08 }}
          className="size-12 rounded-full object-cover ring-[3px] ring-[#fafaf7]"
        />
      ))}
      <span className="flex size-12 items-center justify-center rounded-full bg-[#141816] text-xs font-semibold text-white ring-[3px] ring-[#fafaf7]">
        +2k
      </span>
    </div>
  )
}

function NavButton({ children, onClick, label }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.92 }}
      className="flex size-11 items-center justify-center rounded-full border border-[#141816]/12 bg-white text-[#141816] transition-colors hover:border-[#141816] hover:bg-[#141816] hover:text-white"
    >
      {children}
    </motion.button>
  )
}

function MarqueeRow({ items, speed, reverse = false }) {
  const doubled = [...items, ...items]
  return (
    <div className="group/row overflow-hidden">
      <div
        className={`flex w-max gap-4 will-change-transform motion-safe:animate-[marqueeX_linear_infinite] group-hover/row:[animation-play-state:paused] ${
          reverse ? '[animation-direction:reverse]' : ''
        }`}
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((t, i) => (
          <motion.article
            key={`${t.id}-${i}`}
            whileHover={{ y: -4, rotate: reverse ? 0.6 : -0.6 }}
            transition={{ duration: 0.35, ease }}
            className="flex w-[300px] shrink-0 flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-[#141816]/6 md:w-[340px]"
          >
            <div className="flex items-center gap-3">
              <img
                src={t.avatar}
                alt=""
                loading="lazy"
                className="size-9 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#141816]">{t.name}</p>
                <p className="truncate text-xs text-[#4a524d]">{t.role}</p>
              </div>
              <div className="ml-auto flex gap-0.5 text-[#245a4f]">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="size-3 fill-current" strokeWidth={0} />
                ))}
              </div>
            </div>
            <p className="line-clamp-3 text-sm leading-6 text-[#4a524d]">“{t.quote}”</p>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
