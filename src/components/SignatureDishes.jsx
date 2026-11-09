import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { dishes } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

export default function SignatureDishes() {
  const rootRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray('[data-dish]')
      rows.forEach((row) => {
        const imageWrap = row.querySelector('[data-dish-wrap]')
        const image = row.querySelector('[data-dish-image]')
        const copy = row.querySelectorAll('[data-dish-copy]')
        const line = row.querySelector('[data-dish-line]')

        if (!reduce) {
          gsap.fromTo(
            imageWrap,
            { clipPath: 'inset(12% 12% 12% 12%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.25,
              ease: 'power3.out',
              scrollTrigger: { trigger: row, start: 'top 80%' },
            },
          )

          gsap.fromTo(
            image,
            { scale: 1.15 },
            {
              scale: 1,
              duration: 1.4,
              ease: 'power3.out',
              scrollTrigger: { trigger: row, start: 'top 80%' },
            },
          )

          gsap.fromTo(
            copy,
            { y: 28, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              stagger: 0.07,
              ease: 'power3.out',
              scrollTrigger: { trigger: row, start: 'top 75%' },
            },
          )

          gsap.fromTo(
            line,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: row, start: 'top 70%' },
            },
          )

          gsap.to(image, {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: row,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          })

          if (!coarse && imageWrap) {
            const onMove = (event) => {
              const rect = imageWrap.getBoundingClientRect()
              const x = (event.clientX - rect.left) / rect.width - 0.5
              const y = (event.clientY - rect.top) / rect.height - 0.5
              gsap.to(image, {
                rotateY: x * 8,
                rotateX: -y * 6,
                scale: 1.04,
                duration: 0.5,
                ease: 'power3.out',
                transformPerspective: 900,
              })
            }
            const onLeave = () => {
              gsap.to(image, {
                rotateY: 0,
                rotateX: 0,
                scale: 1,
                duration: 0.7,
                ease: 'expo.out',
              })
            }
            imageWrap.addEventListener('mousemove', onMove)
            imageWrap.addEventListener('mouseleave', onLeave)
          }
        }
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="signatures"
      ref={rootRef}
      className="bg-bg px-5 py-28 md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-accent uppercase">
              Signature
            </p>
            <h2 className="serif mt-5 text-[clamp(2.8rem,7vw,6rem)] leading-[0.95] tracking-[-0.02em] text-ivory">
              The art of flavour
            </h2>
          </div>
          <Link
            to="/menu"
            data-cursor
            className="inline-flex h-12 shrink-0 items-center border border-line px-6 text-[11px] tracking-[0.24em] text-ivory uppercase transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            View full menu →
          </Link>
        </div>

        <div className="mt-20 space-y-28 md:mt-28 md:space-y-36">
          {dishes.map((dish, index) => {
            const reverse = index % 2 === 1
            return (
              <article
                key={dish.id}
                data-dish
                className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14"
              >
                <div
                  className={`relative lg:col-span-7 ${reverse ? 'lg:order-2' : ''}`}
                >
                  <div
                    data-dish-wrap
                    data-cursor
                    className="aspect-[5/4] overflow-hidden"
                    style={{ perspective: '1000px' }}
                  >
                    <img
                      data-dish-image
                      src={dish.image}
                      alt={dish.name}
                      loading="lazy"
                      className="h-[125%] w-full object-cover will-change-transform"
                    />
                  </div>
                </div>

                <div
                  className={`lg:col-span-5 ${reverse ? 'lg:order-1 lg:pr-8' : 'lg:pl-8'}`}
                >
                  <p
                    data-dish-copy
                    className="text-[11px] tracking-[0.28em] text-accent uppercase"
                  >
                    {dish.category}
                  </p>
                  <h3
                    data-dish-copy
                    className="serif mt-4 text-4xl tracking-tight text-ivory md:text-5xl"
                  >
                    {dish.name}
                  </h3>
                  <div
                    data-dish-line
                    className="mt-6 h-px w-20 origin-left bg-accent"
                  />
                  <p
                    data-dish-copy
                    className="mt-6 max-w-sm text-sm leading-7 text-muted md:text-base"
                  >
                    {dish.description}
                  </p>
                  <p
                    data-dish-copy
                    className="mt-8 text-sm tracking-[0.18em] text-accent"
                  >
                    ${dish.price}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
