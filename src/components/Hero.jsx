import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import { images, dishes } from '../data/content'
import { scrollToHash } from '../hooks/useLenis'

const ease = [0.22, 1, 0.36, 1]

const LINES = [
  ['More', 'than', 'a', 'meal.'],
  ['An', 'emotion.'],
]

export default function Hero({ ready }) {
  const reduce = useReducedMotion()
  const cardRef = useRef(null)
  const featured = dishes[1] ?? dishes[0]

  // Mouse tilt for the image card
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.6 })
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-9, 9])
  const imgX = useTransform(sx, [-0.5, 0.5], [-14, 14])
  const imgY = useTransform(sy, [-0.5, 0.5], [-10, 10])

  const onMove = (e) => {
    if (reduce || !cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  const d = (s) => (reduce ? 0.01 : s)
  const state = ready ? 'show' : 'hidden'

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: d(0.7), ease, delay: reduce ? 0 : delay },
    }),
  }

  const lineOffsets = LINES.map((_, li) => LINES.slice(0, li).reduce((n, l) => n + l.length, 0))

  return (
    <section
      id="top"
      className="relative min-h-dvh overflow-hidden bg-[#fafaf7] pt-24 md:pt-28"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="hero-grid absolute inset-0 opacity-[0.5]" />
        <div className="hero-blob hero-blob-a absolute -top-32 -left-24 size-[32rem] rounded-full bg-[#245a4f]/14 blur-3xl" />
        <div className="hero-blob hero-blob-b absolute top-[38%] -right-40 size-[36rem] rounded-full bg-[#e8c9a0]/40 blur-3xl" />
        <div className="hero-blob hero-blob-c absolute -bottom-40 left-[30%] size-[28rem] rounded-full bg-[#245a4f]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-5 pb-16 md:px-10 lg:min-h-[calc(100dvh-7rem)] lg:grid-cols-12 lg:gap-8 lg:pb-10">
        {/* Copy */}
        <div className="lg:col-span-7">
          <motion.div
            variants={fadeUp}
            custom={0.05}
            initial="hidden"
            animate={state}
            className="inline-flex items-center gap-3 rounded-full border border-[#141816]/10 bg-white/70 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-[#245a4f] uppercase backdrop-blur-sm"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#245a4f] opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-[#245a4f]" />
            </span>
            Tonight · Open 18:00 — 23:00
          </motion.div>

          <h1 className="serif mt-7 text-[clamp(3.25rem,8.6vw,7.5rem)] leading-[0.94] tracking-[-0.035em] text-[#141816]">
            {LINES.map((line, li) => (
              <span key={li} className="block">
                {line.map((word, wi) => {
                  const i = lineOffsets[li] + wi
                  const accent = word === 'emotion.'
                  return (
                    <span
                      key={`${li}-${word}`}
                      className="inline-block overflow-hidden pb-[0.08em] align-bottom"
                    >
                      <motion.span
                        initial={{ y: reduce ? 0 : '112%' }}
                        animate={ready ? { y: 0 } : {}}
                        transition={{
                          duration: d(0.95),
                          ease,
                          delay: reduce ? 0 : 0.18 + i * 0.07,
                        }}
                        className={`inline-block ${
                          accent ? 'italic font-light text-[#245a4f]' : ''
                        }`}
                      >
                        {word}
                        {'\u00A0'}
                      </motion.span>
                    </span>
                  )
                })}
              </span>
            ))}
          </h1>

          <motion.p
            variants={fadeUp}
            custom={0.55}
            initial="hidden"
            animate={state}
            className="mt-7 max-w-md text-base leading-7 text-[#4a524d] md:text-[17px] md:leading-8"
          >
            A fine-dining house in Paris where fire, season and silence meet.
            Browse tonight’s menu, then reserve your table in seconds.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={0.68}
            initial="hidden"
            animate={state}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/menu"
              data-cursor
              className="group inline-flex h-13 items-center gap-3 rounded-full bg-[#245a4f] pr-2 pl-7 text-[13px] font-semibold tracking-[0.08em] text-white uppercase shadow-[0_12px_30px_-10px_rgba(36,90,79,0.6)] transition-colors hover:bg-[#1a433b]"
            >
              View menu
              <span className="flex size-9 items-center justify-center rounded-full bg-white text-[#245a4f] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
                <ArrowRight className="size-4" strokeWidth={2} />
              </span>
            </Link>
            <button
              type="button"
              data-cursor
              onClick={() => scrollToHash('#reserve')}
              className="inline-flex h-13 items-center rounded-full border border-[#141816]/15 bg-white px-7 text-[13px] font-semibold tracking-[0.08em] text-[#141816] uppercase transition-colors hover:border-[#141816] hover:bg-[#141816] hover:text-white"
            >
              Reserve a table
            </button>
          </motion.div>

          <motion.ul
            variants={fadeUp}
            custom={0.82}
            initial="hidden"
            animate={state}
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-[#4a524d]"
          >
            <li className="flex items-center gap-2">
              <span className="flex gap-0.5 text-[#245a4f]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" strokeWidth={0} />
                ))}
              </span>
              <span className="font-medium text-[#141816]">4.9</span>
              <span>· 2,400 reviews</span>
            </li>
            <li className="hidden h-4 w-px bg-[#141816]/15 sm:block" />
            <li>Michelin Guide 2026</li>
            <li className="hidden h-4 w-px bg-[#141816]/15 sm:block" />
            <li>Saint-Germain, Paris</li>
          </motion.ul>
        </div>

        {/* Visual */}
        <div className="relative lg:col-span-5">
          <motion.div
            ref={cardRef}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{
              rotateX: reduce ? 0 : rotateX,
              rotateY: reduce ? 0 : rotateY,
              transformPerspective: 1200,
            }}
            initial={{ clipPath: 'inset(8% 8% 8% 8% round 2rem)', opacity: 0 }}
            animate={
              ready
                ? { clipPath: 'inset(0% 0% 0% 0% round 2rem)', opacity: 1 }
                : {}
            }
            transition={{ duration: d(1.3), ease, delay: reduce ? 0 : 0.3 }}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-[#e6ebe8] shadow-[0_40px_80px_-30px_rgba(20,24,22,0.35)] will-change-transform"
          >
            <motion.img
              src={images.hero}
              alt="Fine dining at Maison Noir"
              style={{ x: reduce ? 0 : imgX, y: reduce ? 0 : imgY }}
              initial={{ scale: reduce ? 1.08 : 1.25 }}
              animate={ready ? { scale: 1.08 } : {}}
              transition={{ duration: d(1.8), ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.3 }}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1613]/55 via-transparent to-transparent" />

            {/* Rotating badge */}
            <motion.button
              type="button"
              onClick={() => scrollToHash('#reserve')}
              aria-label="Reserve your evening"
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate={state}
              className="group absolute top-5 right-5 flex size-24 items-center justify-center rounded-full bg-white/90 text-[#141816] shadow-lg backdrop-blur-md md:size-28"
            >
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 size-full motion-safe:animate-[spin_16s_linear_infinite]"
              >
                <defs>
                  <path
                    id="hero-circle"
                    d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"
                  />
                </defs>
                <text className="fill-current text-[9.5px] font-semibold tracking-[0.22em] uppercase">
                  <textPath href="#hero-circle">
                    Reserve · your evening · Maison Noir ·
                  </textPath>
                </text>
              </svg>
              <ArrowUpRight className="relative size-5 transition-transform duration-500 group-hover:rotate-45" />
            </motion.button>

            {/* Dish card */}
            <motion.div
              variants={fadeUp}
              custom={1.1}
              initial="hidden"
              animate={state}
              className="absolute bottom-5 left-5 right-5 flex items-center gap-4 rounded-2xl bg-white/85 p-3 pr-5 shadow-xl backdrop-blur-md"
            >
              <img
                src={featured.image}
                alt={featured.name}
                className="size-16 shrink-0 rounded-xl object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#245a4f] uppercase">
                  Chef’s plate tonight
                </p>
                <p className="serif mt-0.5 truncate text-lg leading-tight text-[#141816]">
                  {featured.name}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-[#141816] tabular-nums">
                ${featured.price}
              </p>
            </motion.div>
          </motion.div>

          {/* Offset accent frame */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={ready ? { opacity: 1, x: 18, y: 18 } : {}}
            transition={{ duration: d(1.1), ease, delay: reduce ? 0 : 0.7 }}
            className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] border border-[#245a4f]/25"
          />
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        variants={fadeUp}
        custom={1.2}
        initial="hidden"
        animate={state}
        className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.28em] text-[#4a524d] uppercase lg:flex"
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-[#141816]/15">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-[#245a4f] motion-safe:animate-[scrollPulse_1.6s_ease-in-out_infinite]" />
        </span>
      </motion.div>
    </section>
  )
}
