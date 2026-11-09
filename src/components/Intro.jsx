import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { images } from '../data/content'
import { splitWords } from '../utils/splitText'

gsap.registerPlugin(ScrollTrigger)

export default function Intro() {
  const rootRef = useRef(null)
  const textRef = useRef(null)
  const imageWrapRef = useRef(null)
  const imageRef = useRef(null)
  const supportRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const words = splitWords(textRef.current)

    const ctx = gsap.context(() => {
      gsap.set(words, { color: '#b5bbb6' })

      if (!reduce) {
        gsap.to(words, {
          color: '#141816',
          stagger: 0.06,
          ease: 'none',
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 78%',
            end: 'bottom 40%',
            scrub: true,
          },
        })

        gsap.fromTo(
          imageWrapRef.current,
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.35,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: imageWrapRef.current,
              start: 'top 85%',
            },
          },
        )

        gsap.fromTo(
          supportRef.current,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: supportRef.current,
              start: 'top 90%',
            },
          },
        )

        gsap.to(imageRef.current, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: imageWrapRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      } else {
        gsap.set(words, { color: '#141816' })
      }
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="experience"
      ref={rootRef}
      className="relative bg-bg px-5 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
        <div>
          <p className="mb-8 text-[11px] tracking-[0.28em] text-accent uppercase">
            Philosophy
          </p>
          <h2
            ref={textRef}
            className="serif text-[clamp(2.4rem,6vw,5.5rem)] leading-[1.05] tracking-[-0.02em]"
          >
            We believe dining is not simply about what is on the table. It is
            about everything you feel.
          </h2>
          <p
            ref={supportRef}
            className="mt-10 max-w-md text-sm leading-7 text-muted md:text-base"
          >
            At Maison Noir, every course is composed like a movement — heat,
            silence, texture, and memory held in careful balance. We cook with
            restraint so the ingredient can speak.
          </p>
        </div>

        <div
          ref={imageWrapRef}
          className="relative ml-auto aspect-[3/4] w-full max-w-sm overflow-hidden"
        >
          <img
            ref={imageRef}
            src={images.intro}
            alt="Seasonal plating"
            className="h-[120%] w-full object-cover will-change-transform"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 to-transparent p-5">
            <p className="text-[10px] tracking-[0.24em] text-accent uppercase">
              Seasonal plate
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
