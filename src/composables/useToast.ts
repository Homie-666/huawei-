import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
  duration: number
  remaining: number
  paused: boolean
}

const DEFAULT_DURATION = 2800

const toasts = ref<ToastItem[]>([])
const timers = new Map<number, ReturnType<typeof setTimeout>>()
const startedAt = new Map<number, number>()

let seq = 0

function clearTimer(id: number) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

function remove(id: number) {
  clearTimer(id)
  startedAt.delete(id)
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function schedule(toast: ToastItem) {
  clearTimer(toast.id)
  startedAt.set(toast.id, Date.now())
  timers.set(
    toast.id,
    setTimeout(() => remove(toast.id), toast.remaining)
  )
}

function show(message: string, type: ToastType = 'success', duration = DEFAULT_DURATION) {
  const toast: ToastItem = {
    id: ++seq,
    message,
    type,
    duration,
    remaining: duration,
    paused: false
  }
  // 最多同时显示 4 条，超出时淘汰最早的一条
  if (toasts.value.length >= 4) {
    remove(toasts.value[0].id)
  }
  toasts.value = [...toasts.value, toast]
  schedule(toast)
  return toast.id
}

function pause(id: number) {
  const toast = toasts.value.find((item) => item.id === id)
  if (!toast || toast.paused) return
  clearTimer(id)
  const elapsed = Date.now() - (startedAt.get(id) || Date.now())
  toast.remaining = Math.max(600, toast.remaining - elapsed)
  toast.paused = true
}

function resume(id: number) {
  const toast = toasts.value.find((item) => item.id === id)
  if (!toast || !toast.paused) return
  toast.paused = false
  schedule(toast)
}

function clear() {
  toasts.value.forEach((toast) => clearTimer(toast.id))
  timers.clear()
  startedAt.clear()
  toasts.value = []
}

export function useToast() {
  return {
    toasts,
    show,
    remove,
    pause,
    resume,
    clear,
    success: (message: string, duration?: number) => show(message, 'success', duration),
    error: (message: string, duration?: number) => show(message, 'error', duration),
    info: (message: string, duration?: number) => show(message, 'info', duration)
  }
}
