import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { images } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

export default function Philosophy() {
  const rootRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduce) return

      gsap.fromTo(
        '[data-chef-image]',
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )

      gsap.fromTo(
        '[data-chef-copy]',
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

  return (
    <section ref={rootRef} className="bg-bg-soft px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            data-chef-image
            src={images.chef}
            alt="Chef at Maison Noir"
            className="absolute inset-0 h-[120%] w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p data-chef-copy className="label">
            Our kitchen
          </p>
          <h2
            data-chef-copy
            className="serif mt-5 text-[clamp(2.4rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.02em] text-ivory"
          >
            Rooted in tradition. Inspired by tomorrow.
          </h2>
          <p
            data-chef-copy
            className="mt-8 max-w-md text-sm leading-7 text-muted md:text-base"
          >
            We source with the season, cook with fire and patience, and plate
            with modern clarity. Nothing ornamental. Nothing rushed. Only what
            earns its place on the table.
          </p>
          <p
            data-chef-copy
            className="serif mt-12 text-2xl italic tracking-wide text-accent"
          >
            — Chef Elise Moreau
          </p>
        </div>
      </div>
    </section>
  )
}
