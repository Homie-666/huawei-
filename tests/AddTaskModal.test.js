import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AddTaskModal from '../src/components/AddTaskModal.vue'

const columns = [
  { id: 'todo', title: '待办', icon: '📥' },
  { id: 'doing', title: '进行中', icon: '⚡' },
  { id: 'done', title: '已完成', icon: '✅' }
]

function mountModal(props = {}, options = {}) {
  return mount(AddTaskModal, {
    props: {
      columns,
      existingCategories: ['开发', '设计'],
      defaultColumn: 'todo',
      ...props
    },
    global: { stubs: { teleport: true } },
    ...options
  })
}

describe('AddTaskModal', () => {
  it('标题为空时阻止提交并提示错误', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn.primary').trigger('click')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('.error-text').text()).toContain('标题')
  })

  it('填写完整后提交的数据结构正确', async () => {
    const wrapper = mountModal()

    await wrapper.find('#task-title').setValue('写实验报告')
    await wrapper.find('#task-desc').setValue('整理鲲鹏实验过程')
    await wrapper.find('#task-category').setValue('开发')
    await wrapper.findAll('.seg-btn')[1].trigger('click')
    await wrapper.findAll('.flag-btn')[1].trigger('click')

    await wrapper.find('.btn.primary').trigger('click')

    const payload = wrapper.emitted('submit')[0][0]
    expect(payload).toMatchObject({
      title: '写实验报告',
      description: '整理鲲鹏实验过程',
      category: '开发',
      columnId: 'doing',
      starred: false,
      urgent: true
    })
  })

  it('标题首尾空格会被裁剪', async () => {
    const wrapper = mountModal()
    await wrapper.find('#task-title').setValue('  带空格的任务  ')
    await wrapper.find('.btn.primary').trigger('click')
    expect(wrapper.emitted('submit')[0][0].title).toBe('带空格的任务')
  })

  it('点击取消派发 close', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn.ghost').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('输入分类时展示已有分类建议，点击后填入', async () => {
    const wrapper = mountModal()
    await wrapper.find('#task-category').setValue('开')

    const chips = wrapper.findAll('.suggest-chip')
    expect(chips).toHaveLength(1)
    expect(chips[0].text()).toBe('开发')

    await chips[0].trigger('click')
    expect(wrapper.find('#task-category').element.value).toBe('开发')
  })

  it('默认列跟随传入的 defaultColumn', () => {
    const wrapper = mountModal({ defaultColumn: 'done' })
    const active = wrapper.find('.seg-btn.is-active')
    expect(active.text()).toContain('已完成')
  })

  it('打开后标题输入框自动获得焦点', async () => {
    const wrapper = mountModal({}, { attachTo: document.body })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(wrapper.find('#task-title').element)
    wrapper.unmount()
  })
})
