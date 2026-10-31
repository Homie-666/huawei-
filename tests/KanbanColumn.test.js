import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KanbanColumn from '../src/components/KanbanColumn.vue'

const column = { id: 'todo', title: '待办', icon: '📥', color: '#4d7cfe' }

function makeTasks() {
  return [
    {
      id: 't1',
      title: '任务一',
      description: '',
      category: '',
      columnId: 'todo',
      starred: false,
      urgent: false,
      createdAt: Date.now()
    },
    {
      id: 't2',
      title: '任务二',
      description: '',
      category: '开发',
      columnId: 'todo',
      starred: true,
      urgent: false,
      createdAt: Date.now()
    }
  ]
}

describe('KanbanColumn', () => {
  it('渲染列标题、计数与卡片', () => {
    const wrapper = mount(KanbanColumn, {
      props: { column, taskList: makeTasks() }
    })
    expect(wrapper.find('.col-title').text()).toBe('待办')
    expect(wrapper.find('.col-count').text()).toBe('2')
    expect(wrapper.findAll('.task-card')).toHaveLength(2)
  })

  it('空列展示 EmptyState，点击后向上派发 add', async () => {
    const wrapper = mount(KanbanColumn, { props: { column, taskList: [] } })
    expect(wrapper.find('.empty').exists()).toBe(true)
    expect(wrapper.find('.col-count').text()).toBe('0')

    await wrapper.find('.empty-btn').trigger('click')
    expect(wrapper.emitted('add')).toEqual([['todo']])
  })

  it('列头的新增按钮派发 add 并带上列 ID', async () => {
    const wrapper = mount(KanbanColumn, { props: { column, taskList: [] } })
    await wrapper.find('.col-add').trigger('click')
    expect(wrapper.emitted('add')).toEqual([['todo']])
  })

  it('drop 时派发 move，索引默认追加到末尾', async () => {
    const wrapper = mount(KanbanColumn, {
      props: { column, taskList: makeTasks() }
    })
    const dataTransfer = { getData: () => 't1', dropEffect: 'move' }
    await wrapper.find('.column').trigger('drop', { dataTransfer })

    expect(wrapper.emitted('move')).toEqual([['t1', 'todo', 2]])
  })

  it('dragover 时进入高亮状态', async () => {
    const wrapper = mount(KanbanColumn, { props: { column, taskList: [] } })
    await wrapper.find('.column').trigger('dragover', {
      dataTransfer: { dropEffect: 'move' },
      clientY: 10
    })
    expect(wrapper.classes()).toContain('is-over')
  })

  it('卡片上的删除事件被转发', async () => {
    const wrapper = mount(KanbanColumn, {
      props: { column, taskList: makeTasks() }
    })
    await wrapper.findAll('.task-card')[0].find('button[title="删除"]').trigger('click')
    expect(wrapper.emitted('remove')).toEqual([['t1']])
  })
})
