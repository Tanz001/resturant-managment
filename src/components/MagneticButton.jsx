import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowUpRight } from 'lucide-react'
import { scrollToHash } from '../hooks/useLenis'

export default function MagneticButton({
  children,
  href = '/#reserve',
  className = '',
  onClick,
}) {
  const rootRef = useRef(null)
  const labelRef = useRef(null)
  const navigate = useNavigate()

  const onMove = (event) => {
    const el = rootRef.current
    if (!el || window.matchMedia('(pointer: coarse)').matches) return
    const rect = el.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    gsap.to(el, { x: x * 0.28, y: y * 0.28, duration: 0.4, ease: 'power3.out' })
    gsap.to(labelRef.current, {
      x: x * 0.12,
      y: y * 0.12,
      duration: 0.4,
      ease: 'power3.out',
    })
  }

  const onLeave = () => {
    gsap.to(rootRef.current, { x: 0, y: 0, duration: 0.6, ease: 'expo.out' })
    gsap.to(labelRef.current, { x: 0, y: 0, duration: 0.6, ease: 'expo.out' })
  }

  const handleClick = (event) => {
    if (onClick) {
      onClick(event)
      return
    }
    if (!href) return
    if (href.startsWith('/#')) {
      event.preventDefault()
      const hash = href.slice(1)
      if (window.location.pathname === '/') {
        scrollToHash(hash)
      } else {
        navigate({ pathname: '/', hash: hash.slice(1) })
      }
    }
  }

  const classNames = `group inline-flex items-center gap-3 bg-[#245a4f] px-7 py-4 text-[12px] font-semibold tracking-[0.14em] text-[#ffffff] uppercase transition-colors hover:bg-[#1a433b] ${className}`

  const inner = (
    <span ref={labelRef} className="inline-flex items-center gap-3 text-[#ffffff]">
      {children}
      <ArrowUpRight
        className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45"
        strokeWidth={1.75}
      />
    </span>
  )

  if (href && href.startsWith('/') && !href.includes('#')) {
    return (
      <Link
        ref={rootRef}
        to={href}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        data-cursor
        className={classNames}
      >
        {inner}
      </Link>
    )
  }

  if (href) {
    return (
      <a
        ref={rootRef}
        href={href}
        onClick={handleClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        data-cursor
        className={classNames}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-cursor
      className={classNames}
    >
      {inner}
    </button>
  )
}
