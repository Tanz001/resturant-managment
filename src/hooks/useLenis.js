import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return undefined

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.1,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const ticker = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)

    window.__lenis = lenis

    return () => {
      gsap.ticker.remove(ticker)
      lenis.destroy()
      window.__lenis = null
    }
  }, [enabled])
}

export function scrollToHash(hash) {
  const target = document.querySelector(hash)
  if (!target) return
  const lenis = window.__lenis
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.25 })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}
