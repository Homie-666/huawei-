/** 按钮点击涟漪效果：在点击位置插入一个快速扩散的圆环 */
export function useRipple() {
  function createRipple(event: MouseEvent | KeyboardEvent) {
    const target = event.currentTarget as HTMLElement | null
    if (!target || typeof document === 'undefined') return

    const rect = target.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.8
    const clientX = 'clientX' in event ? event.clientX : rect.left + rect.width / 2
    const clientY = 'clientY' in event ? event.clientY : rect.top + rect.height / 2

    const wave = document.createElement('span')
    wave.className = 'ripple-wave'
    wave.style.width = `${size}px`
    wave.style.height = `${size}px`
    wave.style.left = `${clientX - rect.left - size / 2}px`
    wave.style.top = `${clientY - rect.top - size / 2}px`

    target.appendChild(wave)
    setTimeout(() => {
      wave.remove()
    }, 620)
  }

  return { createRipple }
}
