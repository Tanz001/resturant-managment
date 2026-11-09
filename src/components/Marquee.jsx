import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PHRASES = [
  'Charcoal',
  'Patience',
  'Season',
  'Craft',
  'Fire',
  'Silence',
  'Taste',
  'Memory',
]

export default function Marquee() {
  const rootRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduce) return
      gsap.to(trackRef.current, {
        xPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const content = [...PHRASES, ...PHRASES]

  return (
    <section
      ref={rootRef}
      className="overflow-hidden border-y border-line bg-bg-soft py-8 md:py-10"
      aria-hidden="true"
    >
      <div
        ref={trackRef}
        className="flex w-max items-center gap-8 whitespace-nowrap will-change-transform md:gap-14"
      >
        {content.map((word, i) => (
          <span key={`${word}-${i}`} className="flex items-center gap-8 md:gap-14">
            <span className="serif text-4xl tracking-tight text-ivory/85 md:text-6xl">
              {word}
            </span>
            <span className="size-1.5 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </section>
  )
}
