import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  STORAGE_KEY,
  clearState,
  createId,
  loadState,
  saveState
} from '../src/utils/storage.js'

const columns = [{ id: 'todo', title: '待办' }]
const tasks = [
  {
    id: 't1',
    title: '写周报',
    description: '',
    category: '工作',
    columnId: 'todo',
    starred: true,
    urgent: false,
    createdAt: 1700000000000
  }
]

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('无数据时返回 null', () => {
    expect(loadState()).toBeNull()
  })

  it('写入后可以原样读回', () => {
    saveState({ columns, tasks })
    const state = loadState()
    expect(state.columns).toHaveLength(1)
    expect(state.tasks[0].title).toBe('写周报')
    expect(state.tasks[0].starred).toBe(true)
  })

  it('JSON 格式错误时降级为默认状态', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    localStorage.setItem(STORAGE_KEY, '{ 这不是合法 JSON')
    expect(loadState()).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('缺少 columns 时视为无效数据', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks }))
    expect(loadState()).toBeNull()
  })

  it('过滤掉非法任务，并补齐缺失字段', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        columns,
        tasks: [
          { title: '  合法任务  ', columnId: '不存在的列' },
          { title: '' },
          null,
          'oops'
        ]
      })
    )
    const state = loadState()
    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0].title).toBe('合法任务')
    expect(state.tasks[0].columnId).toBe('todo')
    expect(state.tasks[0].urgency ?? false).toBe(false)
    expect(state.tasks[0].starred).toBe(false)
    expect(typeof state.tasks[0].id).toBe('string')
  })

  it('重复 ID 只保留一条', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        columns,
        tasks: [
          { id: 'same', title: 'A', columnId: 'todo' },
          { id: 'same', title: 'B', columnId: 'todo' }
        ]
      })
    )
    expect(loadState().tasks).toHaveLength(1)
  })

  it('clearState 清空后读不到数据', () => {
    saveState({ columns, tasks })
    clearState()
    expect(loadState()).toBeNull()
  })

  it('createId 生成的 ID 不重复', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createId()))
    expect(ids.size).toBe(500)
  })
})
