import { computed, ref } from 'vue'
import { themes, defaultThemeId, findTheme } from '../config/themes.ts'
import { applyTheme } from '../utils/cssVariables.ts'

const STORAGE_KEY = 'task-kanban:theme'

const currentId = ref<string>(defaultThemeId)
const previewId = ref<string | null>(null)

function persist(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch (error) {
    console.warn('[theme] 保存主题失败', error)
  }
}

function applyCurrent() {
  applyTheme(activeTheme.value.variables)
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = activeTheme.value.id
  }
}

/** 预览中的主题优先于已选主题 */
const activeTheme = computed(() => findTheme(previewId.value || currentId.value))
const activeId = computed(() => activeTheme.value.id)
const isDark = computed(() => activeTheme.value.dark)

export function useTheme() {
  const isPreviewing = computed(() => previewId.value !== null)

  /** 正式切换并持久化 */
  function setTheme(id: string) {
    currentId.value = findTheme(id).id
    previewId.value = null
    applyCurrent()
    persist(currentId.value)
  }

  /** 悬停预览：不写入 localStorage */
  function preview(id: string) {
    previewId.value = findTheme(id).id
    applyCurrent()
  }

  function cancelPreview() {
    if (!previewId.value) return
    previewId.value = null
    applyCurrent()
  }

  /** 循环切换：晴日 → 深夜 → 多彩 → 晴日 */
  function cycleTheme() {
    const index = themes.findIndex((theme) => theme.id === currentId.value)
    const next = themes[(index + 1) % themes.length]
    setTheme(next.id)
    return next
  }

  /** 应用启动时调用，恢复上次主题 */
  function initTheme() {
    let saved: string | null = null
    try {
      saved = localStorage.getItem(STORAGE_KEY)
    } catch (error) {
      console.warn('[theme] 读取主题失败', error)
    }
    if (saved && themes.some((theme) => theme.id === saved)) {
      currentId.value = saved
    }
    applyCurrent()
  }

  return {
    themes,
    currentId,
    activeId,
    activeTheme,
    isDark,
    isPreviewing,
    setTheme,
    preview,
    cancelPreview,
    cycleTheme,
    initTheme
  }
}
