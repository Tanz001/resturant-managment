import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return undefined

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return undefined

    document.body.classList.add('has-custom-cursor')

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { x: pos.x, y: pos.y }

    const onMove = (event) => {
      pos.x = event.clientX
      pos.y = event.clientY
      gsap.to(dot, { x: pos.x, y: pos.y, duration: 0.12, ease: 'power3.out' })
    }

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18
      ringPos.y += (pos.y - ringPos.y) * 0.18
      gsap.set(ring, { x: ringPos.x, y: ringPos.y })
    }

    const onEnter = () => {
      gsap.to(ring, { scale: 1.8, duration: 0.35, ease: 'power3.out' })
      gsap.to(dot, { scale: 0.45, duration: 0.35, ease: 'power3.out' })
    }

    const onLeave = () => {
      gsap.to(ring, { scale: 1, duration: 0.35, ease: 'power3.out' })
      gsap.to(dot, { scale: 1, duration: 0.35, ease: 'power3.out' })
    }

    window.addEventListener('mousemove', onMove)
    gsap.ticker.add(tick)

    const interactives = () =>
      document.querySelectorAll('a, button, input, textarea, select, [data-cursor]')

    interactives().forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    const observer = new MutationObserver(() => {
      interactives().forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.body.classList.remove('has-custom-cursor')
      window.removeEventListener('mousemove', onMove)
      gsap.ticker.remove(tick)
      observer.disconnect()
      interactives().forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/70 md:block"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent md:block"
      />
    </>
  )
}
