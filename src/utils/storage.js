/**
 * localStorage 读写工具
 * 所有异常都在这里被吃掉并降级，避免脏数据把应用搞白屏
 */

export const STORAGE_KEY = 'task-kanban:state:v1'

export const VALID_COLUMN_IDS = ['todo', 'doing', 'done']

/** 生成轻量唯一 ID */
export function createId() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/** 单条任务的字段校验 + 补默认值 */
function sanitizeTask(task) {
  if (!isPlainObject(task)) return null
  if (typeof task.title !== 'string' || !task.title.trim()) return null

  return {
    id: typeof task.id === 'string' && task.id ? task.id : createId(),
    title: task.title.trim(),
    description: typeof task.description === 'string' ? task.description : '',
    category: typeof task.category === 'string' ? task.category : '',
    columnId: VALID_COLUMN_IDS.includes(task.columnId) ? task.columnId : 'todo',
    starred: task.starred === true,
    urgent: task.urgent === true,
    createdAt: Number.isFinite(task.createdAt) ? task.createdAt : Date.now()
  }
}

/**
 * 读取看板状态
 * @returns {{columns: Array, tasks: Array} | null} 无数据 / 数据损坏时返回 null
 */
export function loadState() {
  if (typeof localStorage === 'undefined') return null

  let raw = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    console.warn('[storage] 读取失败，降级为默认状态', error)
    return null
  }

  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!isPlainObject(parsed)) return null

    const columns = Array.isArray(parsed.columns)
      ? parsed.columns.filter((column) => isPlainObject(column) && typeof column.id === 'string')
      : []
    const tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks.map(sanitizeTask).filter(Boolean)
      : []

    if (!columns.length) return null

    // ID 去重，防止脏数据导致拖拽错乱
    const seen = new Set()
    const uniqueTasks = tasks.filter((task) => {
      if (seen.has(task.id)) return false
      seen.add(task.id)
      return true
    })

    return { columns, tasks: uniqueTasks }
  } catch (error) {
    console.warn('[storage] JSON 解析失败，降级为默认状态', error)
    return null
  }
}

/** 写入看板状态，配额超限等异常静默降级 */
export function saveState(state) {
  if (typeof localStorage === 'undefined') return false
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ columns: state.columns, tasks: state.tasks })
    )
    return true
  } catch (error) {
    console.warn('[storage] 写入失败（可能是隐私模式或空间不足）', error)
    return false
  }
}

/** 清空本地存储 */
export function clearState() {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('[storage] 清除失败', error)
  }
}
