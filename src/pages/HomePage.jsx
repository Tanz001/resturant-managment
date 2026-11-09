import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis, scrollToHash } from '../hooks/useLenis'
import CustomCursor from '../components/CustomCursor'
import ScrollProgress from '../components/ScrollProgress'
import Preloader from '../components/Preloader'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Intro from '../components/Intro'
import Marquee from '../components/Marquee'
import SignatureDishes from '../components/SignatureDishes'
import Story from '../components/Story'
import Philosophy from '../components/Philosophy'
import Atmosphere from '../components/Atmosphere'
import Testimonials from '../components/Testimonials'
import Reservation from '../components/Reservation'
import Footer from '../components/Footer'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const [ready, setReady] = useState(false)
  const doneRef = useRef(false)
  const location = useLocation()
  useLenis(ready)

  const onPreloaderDone = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return undefined
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      if (location.hash) {
        scrollToHash(location.hash)
      }
    })
    return () => cancelAnimationFrame(id)
  }, [ready, location.hash])

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <CustomCursor />
      <ScrollProgress ready={ready} />
      {!ready ? <Preloader onComplete={onPreloaderDone} /> : null}
      <Navbar ready={ready} />
      <main className="site-shell">
        <Hero ready={ready} />
        {ready ? (
          <>
            <Intro />
            <Marquee />
            <SignatureDishes />
            <Story />
            <Philosophy />
            <Atmosphere />
            <Testimonials />
            <Reservation />
            <Footer />
          </>
        ) : null}
      </main>
    </>
  )
}
