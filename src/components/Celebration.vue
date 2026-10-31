<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  effect: { type: String, default: 'confetti' },
  duration: { type: Number, default: 2200 }
})

const emit = defineEmits(['complete'])

const canvasRef = ref(null)

let ctx = null
let particles = []
let rafId = null
let endAt = 0
let dpr = 1
let running = false

function readPalette() {
  if (typeof window === 'undefined') return ['#4d7cfe', '#7c5cff', '#12b76a', '#f79009', '#f04438']
  const styles = getComputedStyle(document.documentElement)
  const names = ['--c-primary', '--c-accent', '--c-success', '--c-warning', '--c-danger']
  const colors = names.map((name) => styles.getPropertyValue(name).trim()).filter(Boolean)
  return colors.length ? colors : ['#4d7cfe', '#7c5cff', '#12b76a', '#f79009', '#f04438']
}

function sizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  dpr = window.devicePixelRatio || 1
  const width = window.innerWidth
  const height = window.innerHeight
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function createParticles() {
  const width = window.innerWidth
  const height = window.innerHeight
  const colors = readPalette()
  const list = []

  if (props.effect === 'stars') {
    for (let i = 0; i < 46; i += 1) {
      list.push({
        kind: 'star',
        x: Math.random() * width,
        y: height * 0.72 + Math.random() * height * 0.3,
        vx: (Math.random() - 0.5) * 1.4,
        vy: -(1.6 + Math.random() * 2.6),
        g: -0.004,
        size: 7 + Math.random() * 11,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.06,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.006 + Math.random() * 0.006,
        sway: Math.random() * Math.PI * 2
      })
    }
    return list
  }

  if (props.effect === 'hearts') {
    for (let i = 0; i < 40; i += 1) {
      list.push({
        kind: 'heart',
        x: width * 0.5 + (Math.random() - 0.5) * width * 0.66,
        y: height * 0.85 + Math.random() * 60,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(1.4 + Math.random() * 2.4),
        g: -0.003,
        size: 8 + Math.random() * 12,
        rot: (Math.random() - 0.5) * 0.5,
        vr: (Math.random() - 0.5) * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.005 + Math.random() * 0.005,
        sway: Math.random() * Math.PI * 2
      })
    }
    return list
  }

  // 默认彩带：左右两个礼炮对射
  for (let i = 0; i < 120; i += 1) {
    const fromLeft = i % 2 === 0
    const originX = fromLeft ? width * 0.17 : width * 0.83
    const baseAngle = fromLeft ? -Math.PI / 3 : (-Math.PI * 2) / 3
    const angle = baseAngle + (Math.random() - 0.5) * 0.85
    const speed = 8 + Math.random() * 11

    list.push({
      kind: 'confetti',
      x: originX + (Math.random() - 0.5) * 70,
      y: height - 46,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      g: 0.24 + Math.random() * 0.14,
      w: 4.5 + Math.random() * 6,
      h: 8 + Math.random() * 9,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.36,
      color: colors[i % colors.length],
      life: 1,
      decay: 0.006 + Math.random() * 0.005,
      sway: Math.random() * Math.PI * 2
    })
  }
  return list
}

function starPath(points, outer, inner) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = (i * Math.PI) / points - Math.PI / 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function heartPath(size) {
  ctx.beginPath()
  ctx.moveTo(0, size * 0.34)
  ctx.bezierCurveTo(size * 1.02, -size * 0.32, size * 0.44, -size * 0.98, 0, -size * 0.36)
  ctx.bezierCurveTo(-size * 0.44, -size * 0.98, -size * 1.02, -size * 0.32, 0, size * 0.34)
  ctx.closePath()
}

function draw(now) {
  if (!ctx) return

  const width = window.innerWidth
  const height = window.innerHeight
  ctx.clearRect(0, 0, width, height)

  const showFade = now > endAt - 600
  const fadeFactor = showFade ? Math.max(0, (endAt - now) / 600) : 1

  let alive = 0
  particles.forEach((particle) => {
    particle.life -= particle.decay
    if (particle.life <= 0) return
    alive += 1

    particle.vy += particle.g
    particle.vx *= 0.995
    particle.sway += 0.06
    particle.x += particle.vx + Math.sin(particle.sway) * 0.5
    particle.y += particle.vy
    particle.rot += particle.vr

    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, particle.life)) * fadeFactor
    ctx.translate(particle.x, particle.y)
    ctx.rotate(particle.rot)
    ctx.fillStyle = particle.color

    if (particle.kind === 'confetti') {
      ctx.fillRect(-particle.w / 2, -particle.h / 2, particle.w, particle.h)
    } else if (particle.kind === 'star') {
      starPath(5, particle.size, particle.size * 0.44)
      ctx.fill()
    } else {
      heartPath(particle.size)
      ctx.fill()
    }

    ctx.restore()
  })

  particles = particles.filter((particle) => particle.life > 0)

  if (alive > 0 && (particles.length > 0 || now < endAt)) {
    rafId = requestAnimationFrame(draw)
  } else {
    finish()
  }
}

function finish() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  particles = []
  if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  if (running) {
    running = false
    emit('complete')
  }
}

function start() {
  if (typeof window === 'undefined') return
  running = true
  sizeCanvas()
  particles = createParticles()
  endAt = performance.now() + props.duration
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(draw)
}

function stop() {
  running = false
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  particles = []
  if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
}

function onResize() {
  if (!running) return
  sizeCanvas()
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        emit('complete')
        return
      }
      window.addEventListener('resize', onResize)
      start()
    } else {
      window.removeEventListener('resize', onResize)
      stop()
    }
  }
)

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', onResize)
  stop()
})
</script>

<template>
  <canvas
    v-show="visible"
    ref="canvasRef"
    class="celebration-canvas"
    aria-hidden="true"
  ></canvas>
</template>

<style scoped>
.celebration-canvas {
  position: fixed;
  inset: 0;
  z-index: var(--z-celebration);
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}
</style>
