import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Preloader({ onComplete }) {
  const rootRef = useRef(null)
  const barRef = useRef(null)
  const percentRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const state = { value: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(rootRef.current, {
          yPercent: -100,
          duration: reduce ? 0.01 : 1.1,
          ease: 'expo.inOut',
          onComplete,
        })
      },
    })

    if (reduce) {
      state.value = 100
      if (percentRef.current) percentRef.current.textContent = '100'
      if (barRef.current) barRef.current.style.width = '100%'
      tl.to({}, { duration: 0.01 })
      return () => tl.kill()
    }

    tl.to(state, {
      value: 100,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(state.value)
        if (percentRef.current) percentRef.current.textContent = String(v)
        if (barRef.current) barRef.current.style.width = `${v}%`
      },
    }).to({}, { duration: 0.25 })

    return () => tl.kill()
  }, [onComplete])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-bg"
      aria-hidden="true"
    >
      <p className="serif text-3xl tracking-[0.35em] text-ivory md:text-4xl">
        MAISON NOIR
      </p>
      <p className="label mt-10">Preparing your experience</p>
      <div className="mt-8 h-px w-48 overflow-hidden bg-line md:w-64">
        <div ref={barRef} className="h-full w-0 bg-accent" />
      </div>
      <p className="mt-5 font-sans text-sm tracking-[0.2em] text-muted tabular-nums">
        <span ref={percentRef}>0</span>%
      </p>
    </div>
  )
}
