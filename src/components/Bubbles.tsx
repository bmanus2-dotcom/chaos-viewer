import { useEffect, useRef } from 'react'

interface Bubble {
  el: HTMLDivElement
  r: number
  x: number          // base horizontal anchor
  y: number          // current vertical position (rises over time)
  rise: number       // px/sec upward
  swayAmp: number    // horizontal sway amplitude (px)
  swaySpeed: number  // sway frequency
  swayPhase: number
  pushX: number      // soft cursor-displacement, decays back to 0
  pushY: number
  popped: boolean
}

/** Interactive Frutiger Aero bubble field: bubbles rise on a gentle wind, sway
 *  side to side, drift softly away from the cursor, and pop when clicked
 *  anywhere on them (then respawn from below). */
export function Bubbles({ count = 14 }: { count?: number }) {
  const holder = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hostEl = holder.current
    if (!hostEl) return
    const host: HTMLDivElement = hostEl
    const bubbles: Bubble[] = []
    const mouse = { x: -9999, y: -9999 }

    function reset(b: Bubble, fromBottom: boolean) {
      b.r = 14 + Math.random() * 42
      b.el.style.width = b.el.style.height = `${b.r * 2}px`
      b.x = Math.random() * window.innerWidth
      b.y = fromBottom ? window.innerHeight + b.r + Math.random() * 220
                       : Math.random() * window.innerHeight
      b.rise = 10 + Math.random() * 20            // px/sec
      b.swayAmp = 12 + Math.random() * 46
      b.swaySpeed = 0.15 + Math.random() * 0.35
      b.swayPhase = Math.random() * Math.PI * 2
      b.pushX = 0
      b.pushY = 0
      b.popped = false
    }

    function makeBubble(): Bubble {
      const el = document.createElement('div')
      el.className = 'aero-bubble'
      const b: Bubble = { el, r: 20, x: 0, y: 0, rise: 15, swayAmp: 30, swaySpeed: 0.25, swayPhase: 0, pushX: 0, pushY: 0, popped: false }
      // pop on a click ANYWHERE on the bubble (pointerdown covers the whole disc)
      el.addEventListener('pointerdown', e => { e.preventDefault(); pop(b) })
      host.appendChild(el)
      reset(b, false)
      return b
    }

    function pop(b: Bubble) {
      if (b.popped) return
      b.popped = true
      b.el.classList.add('popping')
      setTimeout(() => {
        b.el.classList.remove('popping')
        reset(b, true)
      }, 900 + Math.random() * 1400)
    }

    for (let i = 0; i < count; i++) bubbles.push(makeBubble())

    const onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    window.addEventListener('pointermove', onMove, { passive: true })

    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)   // seconds, clamped
      last = now
      const W = window.innerWidth
      for (const b of bubbles) {
        if (b.popped) continue
        // steady rise + smooth sinusoidal sway (the "wind")
        b.y -= b.rise * dt
        const swayX = b.swayAmp * Math.sin(now * 0.001 * b.swaySpeed + b.swayPhase)

        // soft cursor repulsion: nudge a push offset that eases back to zero
        const cx = b.x + swayX + b.pushX
        const cy = b.y + b.pushY
        const dx = cx - mouse.x, dy = cy - mouse.y
        const reach = 130 + b.r
        const d2 = dx * dx + dy * dy
        if (d2 < reach * reach && d2 > 1) {
          const d = Math.sqrt(d2)
          const f = (1 - d / reach) * 26 * dt      // gentle, framerate-independent
          b.pushX += (dx / d) * f
          b.pushY += (dy / d) * f
        }
        b.pushX *= 0.92
        b.pushY *= 0.92

        if (b.y < -b.r * 2 - 20) reset(b, true)     // recycle at the top

        // position via left/top so the pop keyframe's transform:scale runs in place
        b.el.style.left = `${b.x + swayX + b.pushX - b.r}px`
        b.el.style.top = `${b.y + b.pushY - b.r}px`
        if (b.x < -60) b.x = W + 60
        else if (b.x > W + 60) b.x = -60
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      host.innerHTML = ''
    }
  }, [count])

  return <div ref={holder} className="aero-bubble-field" aria-hidden />
}
