import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { atmosphereCaptions, images } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

export default function Atmosphere() {
  const rootRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 900px)').matches

    const ctx = gsap.context(() => {
      if (reduce || isMobile) return

      const track = trackRef.current
      const amount = track.scrollWidth - window.innerWidth

      gsap.to(track, {
        x: () => -amount,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: () => `+=${amount}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="overflow-hidden bg-bg-soft py-20 md:py-0"
    >
      <div className="mb-10 px-5 md:hidden">
        <p className="label">Atmosphere</p>
        <h2 className="serif mt-3 text-4xl tracking-tight">Inside the house</h2>
      </div>

      <div className="md:contents overflow-x-auto">
      <div
        ref={trackRef}
        className="flex w-max gap-5 px-5 md:h-dvh md:items-center md:gap-8 md:px-10"
      >
        <div className="hidden w-[28vw] shrink-0 md:block">
          <p className="label">Atmosphere</p>
          <h2 className="serif mt-5 text-5xl leading-none tracking-tight xl:text-6xl">
            Inside
            <br />
            the house
          </h2>
          <p className="mt-6 max-w-xs text-sm leading-7 text-muted">
            Drag with your scroll — a quiet walk through the room before service.
          </p>
        </div>

        {images.atmosphere.map((src, index) => (
          <figure
            key={src}
            className="group relative w-[78vw] shrink-0 overflow-hidden md:w-[38vw]"
          >
            <div className="aspect-[4/5] overflow-hidden md:aspect-[3/4]">
              <img
                src={src}
                alt={atmosphereCaptions[index]}
                loading="lazy"
                data-cursor
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
            </div>
            <figcaption className="mt-4 text-[11px] tracking-[0.22em] uppercase text-muted">
              {atmosphereCaptions[index]}
            </figcaption>
          </figure>
        ))}
      </div>
      </div>
    </section>
  )
}
