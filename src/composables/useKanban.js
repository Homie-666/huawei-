import { computed, ref, watch } from 'vue'
import { createId, loadState, saveState, VALID_COLUMN_IDS } from '../utils/storage.js'

/** 看板三列定义 */
export const DEFAULT_COLUMNS = [
  { id: 'todo', title: '待办', icon: '📥', color: 'var(--c-col-todo)' },
  { id: 'doing', title: '进行中', icon: '⚡', color: 'var(--c-col-doing)' },
  { id: 'done', title: '已完成', icon: '✅', color: 'var(--c-col-done)' }
]

const MINUTE = 60 * 1000

/** 首次打开时给点示例数据，方便直接体验拖拽 */
function createDemoTasks() {
  const now = Date.now()
  return [
    {
      id: createId(),
      title: '梳理本周迭代需求',
      description: '把散落在聊天记录里的需求收敛成一份清单，标出优先级。',
      category: '产品',
      columnId: 'todo',
      starred: true,
      urgent: false,
      createdAt: now - 26 * MINUTE
    },
    {
      id: createId(),
      title: '修复移动端看板列换行错位',
      description: '窄屏下三列挤成一行，需要改成纵向堆叠。',
      category: '开发',
      columnId: 'todo',
      starred: false,
      urgent: true,
      createdAt: now - 95 * MINUTE
    },
    {
      id: createId(),
      title: '设计主题切换的交互动效',
      description: '悬停预览 + 切换过渡，让换肤有质感。',
      category: '设计',
      columnId: 'doing',
      starred: false,
      urgent: false,
      createdAt: now - 4 * 60 * MINUTE
    },
    {
      id: createId(),
      title: '补齐 localStorage 异常降级逻辑',
      description: '脏数据 / 隐私模式下不能白屏。',
      category: '开发',
      columnId: 'doing',
      starred: true,
      urgent: false,
      createdAt: now - 20 * 60 * MINUTE
    },
    {
      id: createId(),
      title: '完成拖拽流转的联调',
      description: '三列之间双向拖拽已经跑通，卡片位置也很准。',
      category: '测试',
      columnId: 'done',
      starred: false,
      urgent: false,
      createdAt: now - 30 * 60 * MINUTE
    }
  ]
}

const columns = ref(DEFAULT_COLUMNS.map((column) => ({ ...column })))
const tasks = ref([])

/** 用默认列信息兜底，保证老数据也能正常渲染 */
function mergeColumns(savedColumns) {
  return DEFAULT_COLUMNS.map((preset) => {
    const saved = savedColumns.find((column) => column.id === preset.id)
    return {
      ...preset,
      title: saved && typeof saved.title === 'string' && saved.title ? saved.title : preset.title
    }
  })
}

function persist() {
  saveState({ columns: columns.value, tasks: tasks.value })
}

function hydrate() {
  const saved = loadState()
  if (saved && saved.columns.length) {
    columns.value = mergeColumns(saved.columns)
    tasks.value = saved.tasks
  } else {
    tasks.value = createDemoTasks()
    persist()
  }
}

/** 取某列任务列表（数组顺序即展示顺序） */
function tasksOf(columnId) {
  return tasks.value.filter((task) => task.columnId === columnId)
}

/**
 * 在目标列内重新定位任务
 * @param {string} taskId
 * @param {string} columnId
 * @param {number} index 目标列内的插入位置
 */
function reorder(taskId, columnId, index) {
  const task = tasks.value.find((item) => item.id === taskId)
  if (!task) return
  task.columnId = columnId

  const rest = tasks.value.filter((item) => item.id !== taskId)
  const columnTasks = rest.filter((item) => item.columnId === columnId)
  const target = Math.max(0, Math.min(Number.isFinite(index) ? index : columnTasks.length, columnTasks.length))

  let insertAt
  if (!columnTasks.length) {
    insertAt = rest.length
  } else if (target >= columnTasks.length) {
    insertAt = rest.indexOf(columnTasks[columnTasks.length - 1]) + 1
  } else {
    insertAt = rest.indexOf(columnTasks[target])
  }

  rest.splice(insertAt, 0, task)
  tasks.value = rest
}

function addTask(payload = {}) {
  const title = String(payload.title || '').trim()
  if (!title) return null

  const task = {
    id: createId(),
    title,
    description: String(payload.description || '').trim(),
    category: String(payload.category || '').trim(),
    columnId: VALID_COLUMN_IDS.includes(payload.columnId) ? payload.columnId : 'todo',
    starred: payload.starred === true,
    urgent: payload.urgent === true,
    createdAt: Date.now()
  }

  tasks.value = [task, ...tasks.value]
  return task
}

function removeTask(taskId) {
  const target = tasks.value.find((task) => task.id === taskId)
  if (!target) return null
  tasks.value = tasks.value.filter((task) => task.id !== taskId)
  return target
}

/** 切换星标 / 紧急等布尔字段 */
function toggleFlag(taskId, field) {
  const task = tasks.value.find((item) => item.id === taskId)
  if (!task || !['starred', 'urgent'].includes(field)) return null
  task[field] = !task[field]
  return { task, value: task[field] }
}

/**
 * 拖拽移动任务
 * @returns {{task: object, from: string, to: string, completed: boolean} | null}
 */
function moveTask(taskId, columnId, index) {
  const task = tasks.value.find((item) => item.id === taskId)
  if (!task || !VALID_COLUMN_IDS.includes(columnId)) return null

  const from = task.columnId
  const to = columnId
  reorder(taskId, columnId, index)

  return {
    task,
    from,
    to,
    completed: to === 'done' && from !== 'done'
  }
}

function resetBoard() {
  tasks.value = []
  persist()
}

const grouped = computed(() => {
  const result = { todo: [], doing: [], done: [] }
  tasks.value.forEach((task) => {
    if (result[task.columnId]) result[task.columnId].push(task)
  })
  return result
})

const stats = computed(() => {
  const total = tasks.value.length
  const done = grouped.value.done.length
  const doing = grouped.value.doing.length
  const todo = grouped.value.todo.length
  const starred = tasks.value.filter((task) => task.starred).length
  const urgent = tasks.value.filter((task) => task.urgent).length

  return {
    total,
    todo,
    doing,
    done,
    starred,
    urgent,
    progress: total ? Math.round((done / total) * 100) : 0
  }
})

/** 已用过的分类，供新增弹窗自动补全 */
const existingCategories = computed(() => {
  const set = new Set()
  tasks.value.forEach((task) => {
    if (task.category) set.add(task.category)
  })
  return [...set]
})

// 任何变更自动落盘
watch([tasks, columns], persist, { deep: true })

hydrate()

export function useKanban() {
  return {
    columns,
    tasks,
    grouped,
    stats,
    existingCategories,
    tasksOf,
    addTask,
    removeTask,
    toggleFlag,
    moveTask,
    resetBoard,
    persist
  }
}
