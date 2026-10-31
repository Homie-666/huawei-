/** CSS 变量动态注入工具 —— 主题切换的核心，无需重载样式表 */

export function applyTheme(
  variables: Record<string, string>,
  root?: HTMLElement | null
): void {
  if (typeof document === 'undefined') return
  const target = root || document.documentElement
  if (!target) return

  Object.entries(variables).forEach(([name, value]) => {
    target.style.setProperty(name, value)
  })
}

export function getCssVariable(name: string, root?: HTMLElement | null): string {
  if (typeof window === 'undefined') return ''
  const target = root || document.documentElement
  return getComputedStyle(target).getPropertyValue(name).trim()
}

/** 清空被动态注入的主题变量，回落到 variables.css 中的默认值 */
export function clearTheme(names: string[], root?: HTMLElement | null): void {
  if (typeof document === 'undefined') return
  const target = root || document.documentElement
  names.forEach((name) => target.style.removeProperty(name))
}
