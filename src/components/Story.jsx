import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { images } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

export default function Story() {
  const rootRef = useRef(null)
  const imageRef = useRef(null)
  const overlayRef = useRef(null)
  const titleRef = useRef(null)
  const copyARef = useRef(null)
  const copyBRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 768px)').matches

    const ctx = gsap.context(() => {
      if (reduce || isMobile) {
        gsap.set([copyARef.current, copyBRef.current], { opacity: 1 })
        return
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: '+=180%',
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      })

      tl.fromTo(imageRef.current, { scale: 1.18 }, { scale: 1, ease: 'none' }, 0)
        .fromTo(overlayRef.current, { opacity: 0.2 }, { opacity: 0.55, ease: 'none' }, 0)
        .fromTo(
          titleRef.current,
          { y: 80, opacity: 0.2 },
          { y: -40, opacity: 1, ease: 'none' },
          0,
        )
        .fromTo(
          copyARef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.25,
        )
        .fromTo(
          copyBRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.55,
        )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="story"
      ref={rootRef}
      className="relative h-dvh min-h-[640px] overflow-hidden bg-bg"
    >
      <div className="absolute inset-0">
        <img
          ref={imageRef}
          src={images.story}
          alt="Maison Noir dining room"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div ref={overlayRef} className="absolute inset-0 bg-[#0d1613]/55" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-5 md:px-10">
        <div className="mx-auto w-full max-w-[1200px]">
          <h2
            ref={titleRef}
            className="serif max-w-[10ch] text-[clamp(3rem,8vw,7rem)] leading-[0.92] tracking-[-0.02em] text-white"
          >
            Crafted with patience. Served with passion.
          </h2>
          <p
            ref={copyARef}
            className="mt-10 max-w-md text-sm leading-7 text-white/85 md:text-base"
          >
            Hours before service, the kitchen is already listening — to stock
            reducing, bread blooming, and the quiet discipline of mise en place.
          </p>
          <p
            ref={copyBRef}
            className="mt-5 max-w-md text-sm leading-7 text-white/65 md:text-base"
          >
            What reaches your table is not a performance. It is a conversation
            between craft and appetite.
          </p>
        </div>
      </div>
    </section>
  )
}
