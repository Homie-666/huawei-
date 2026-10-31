import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskCard from '../src/components/TaskCard.vue'

function makeTask(overrides = {}) {
  return {
    id: 't1',
    title: '完成拖拽联调',
    description: '三列之间双向拖拽',
    category: '开发',
    columnId: 'todo',
    starred: false,
    urgent: false,
    createdAt: Date.now() - 60 * 1000,
    ...overrides
  }
}

describe('TaskCard', () => {
  it('渲染标题、描述、分类与相对时间', () => {
    const wrapper = mount(TaskCard, { props: { task: makeTask() } })
    expect(wrapper.find('.card-title').text()).toBe('完成拖拽联调')
    expect(wrapper.find('.card-desc').text()).toContain('双向拖拽')
    expect(wrapper.find('.tag').text()).toBe('开发')
    expect(wrapper.find('.time').text()).toContain('分钟前')
  })

  it('有卡片可拖拽属性', () => {
    const wrapper = mount(TaskCard, { props: { task: makeTask() } })
    expect(wrapper.attributes('draggable')).toBe('true')
    expect(wrapper.attributes('data-task-card')).toBeDefined()
  })

  it('点击星标触发 toggle(starred)', async () => {
    const wrapper = mount(TaskCard, { props: { task: makeTask() } })
    await wrapper.find('button[title="星标"]').trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([['t1', 'starred']])
  })

  it('点击紧急触发 toggle(urgent)', async () => {
    const wrapper = mount(TaskCard, { props: { task: makeTask() } })
    await wrapper.find('button[title="紧急"]').trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([['t1', 'urgent']])
  })

  it('点击删除触发 remove', async () => {
    const wrapper = mount(TaskCard, { props: { task: makeTask() } })
    await wrapper.find('button[title="删除"]').trigger('click')
    expect(wrapper.emitted('remove')).toEqual([['t1']])
  })

  it('紧急任务带 is-urgent 样式与角标', () => {
    const wrapper = mount(TaskCard, { props: { task: makeTask({ urgent: true }) } })
    expect(wrapper.classes()).toContain('is-urgent')
    expect(wrapper.find('.badge-urgent').exists()).toBe(true)
  })

  it('已完成任务标题带删除线样式类', () => {
    const wrapper = mount(TaskCard, { props: { task: makeTask({ columnId: 'done' }) } })
    expect(wrapper.classes()).toContain('is-done')
    expect(wrapper.find('.badge-done').exists()).toBe(true)
  })
})
