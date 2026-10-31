import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../src/App.vue'

function mountApp() {
  return mount(App, { global: { stubs: { teleport: true } } })
}

describe('App 集成冒烟', () => {
  it('渲染三列看板与示例任务', () => {
    const wrapper = mountApp()
    expect(wrapper.findAll('.column')).toHaveLength(3)
    expect(wrapper.findAll('.col-title').map((node) => node.text())).toEqual([
      '待办',
      '进行中',
      '已完成'
    ])
    expect(wrapper.findAll('.task-card').length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('新增任务后卡片数量 +1 并弹出趣味提示', async () => {
    const wrapper = mountApp()
    const before = wrapper.findAll('.task-card').length

    await wrapper.find('.navbar .btn.primary').trigger('click')
    expect(wrapper.find('.modal-card').exists()).toBe(true)

    await wrapper.find('#task-title').setValue('集成冒烟测试任务')
    await wrapper.find('.modal-card .btn.primary').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.task-card')).toHaveLength(before + 1)
    expect(wrapper.find('.modal-card').exists()).toBe(false)
    expect(wrapper.find('.toast').exists()).toBe(true)
    wrapper.unmount()
  })

  it('提交空标题时不新增任务，弹窗保留', async () => {
    const wrapper = mountApp()
    const before = wrapper.findAll('.task-card').length

    await wrapper.find('.navbar .btn.primary').trigger('click')
    await wrapper.find('.modal-card .btn.primary').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.task-card')).toHaveLength(before)
    expect(wrapper.find('.modal-card').exists()).toBe(true)
    expect(wrapper.find('.error-text').exists()).toBe(true)
    wrapper.unmount()
  })

  it('切换主题会写入 html 的 data-theme', async () => {
    const wrapper = mountApp()
    await wrapper.find('.theme-selector .trigger').trigger('click')
    const items = wrapper.findAll('.theme-selector .item')
    expect(items.length).toBe(3)

    await items[1].trigger('click')
    expect(document.documentElement.dataset.theme).toBe('dark')

    await items[0].trigger('click')
    expect(document.documentElement.dataset.theme).toBe('light')
    wrapper.unmount()
  })

  it('重置看板需要二次确认', async () => {
    const wrapper = mountApp()
    await wrapper.find('.navbar .btn.ghost').trigger('click')
    expect(wrapper.find('.confirm-card').exists()).toBe(true)

    await wrapper.find('.c-btn.ghost').trigger('click')
    expect(wrapper.find('.confirm-card').exists()).toBe(false)
    expect(wrapper.findAll('.task-card').length).toBeGreaterThan(0)
    wrapper.unmount()
  })
})
