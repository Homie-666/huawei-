<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import NavBar from './components/NavBar.vue'
import KanbanColumn from './components/KanbanColumn.vue'
import AddTaskModal from './components/AddTaskModal.vue'
import FunToast from './components/FunToast.vue'
import Celebration from './components/Celebration.vue'
import { useKanban } from './composables/useKanban.js'
import { useToast } from './composables/useToast.ts'
import { randomMessage } from './config/toastMessages.ts'

const {
  columns,
  tasks,
  grouped,
  stats,
  existingCategories,
  addTask,
  removeTask,
  toggleFlag,
  moveTask,
  resetBoard
} = useKanban()

const { show } = useToast()

const modalOpen = ref(false)
const modalColumn = ref('todo')
const confirmOpen = ref(false)
const celebrateVisible = ref(false)
const celebrateEffect = ref('confetti')

const effects = ['confetti', 'stars', 'hearts']

const boardHint = computed(() => {
  if (!stats.value.total) return '还没有任务，点右上角「新增任务」开始吧'
  if (stats.value.progress === 100) return '全部完成，今天可以收工了 🎉'
  return '按住卡片拖到另一列，状态会立即更新'
})

function openCreate(columnId = 'todo') {
  modalColumn.value = columnId
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function handleSubmit(payload) {
  const task = addTask(payload)
  if (!task) return
  modalOpen.value = false
  show(randomMessage('add'))
}

function handleRemove(taskId) {
  const removed = removeTask(taskId)
  if (removed) show(randomMessage('remove'), 'info')
}

function handleToggle(taskId, field) {
  const result = toggleFlag(taskId, field)
  if (!result) return

  if (field === 'starred') {
    show(randomMessage(result.value ? 'star' : 'unstar'))
  } else {
    show(randomMessage(result.value ? 'urgent' : 'unurgent'), result.value ? 'info' : 'success')
  }
}

function celebrate() {
  celebrateEffect.value = effects[Math.floor(Math.random() * effects.length)]
  // 先关再开，保证连续完成也能重复触发动画
  celebrateVisible.value = false
  window.setTimeout(() => {
    celebrateVisible.value = true
  }, 20)
}

function handleMove(taskId, columnId, index) {
  const result = moveTask(taskId, columnId, index)
  if (!result) return

  if (result.completed) {
    celebrate()
    show(randomMessage('done'))
  } else {
    show(randomMessage('move'), 'info')
  }
}

function confirmReset() {
  resetBoard()
  confirmOpen.value = false
  show(randomMessage('reset'), 'info')
}

function onCelebrateComplete() {
  celebrateVisible.value = false
}

function onKeydown(event) {
  const meta = event.ctrlKey || event.metaKey
  if (meta && event.key.toLowerCase() === 'n') {
    event.preventDefault()
    if (!modalOpen.value) openCreate('todo')
    return
  }
  if (event.key === 'Escape') {
    if (confirmOpen.value) confirmOpen.value = false
    else if (modalOpen.value) modalOpen.value = false
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="app-shell">
    <NavBar :tasks="tasks" @add-task="openCreate('todo')" @reset="confirmOpen = true" />

    <main class="board-wrap">
      <div class="board-bar">
        <p class="hint">
          <span class="hint-dot"></span>
          {{ boardHint }}
        </p>
        <p class="shortcut">
          <kbd>Ctrl</kbd><span>+</span><kbd>N</kbd> 快速新增
        </p>
      </div>

      <div class="board">
        <KanbanColumn
          v-for="column in columns"
          :key="column.id"
          :column="column"
          :task-list="grouped[column.id]"
          @move="handleMove"
          @toggle="handleToggle"
          @remove="handleRemove"
          @add="openCreate"
        />
      </div>

      <footer class="page-foot">
        <span>数据保存在浏览器 localStorage，刷新不会丢</span>
        <span class="dot">·</span>
        <span>支持亮色 / 暗色 / 多彩三套主题</span>
      </footer>
    </main>

    <AddTaskModal
      v-if="modalOpen"
      :columns="columns"
      :existing-categories="existingCategories"
      :default-column="modalColumn"
      @submit="handleSubmit"
      @close="closeModal"
    />

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="confirmOpen" class="confirm-mask" @click.self="confirmOpen = false">
          <div class="confirm-card" role="dialog" aria-modal="true">
            <div class="confirm-icon">🧹</div>
            <h2 class="confirm-title">清空整个看板？</h2>
            <p class="confirm-desc">
              当前 {{ stats.total }} 个任务会被全部删除，此操作无法撤销。
            </p>
            <div class="confirm-actions">
              <button class="c-btn ghost" type="button" @click="confirmOpen = false">再想想</button>
              <button class="c-btn danger" type="button" @click="confirmReset">确认清空</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <FunToast />
    <Celebration
      :visible="celebrateVisible"
      :effect="celebrateEffect"
      :duration="2400"
      @complete="onCelebrateComplete"
    />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.board-wrap {
  flex: 1;
  width: 100%;
  max-width: var(--layout-max);
  margin: 0 auto;
  padding: 16px 22px 24px;
}

.board-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 4px 12px;
}

.hint {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: var(--c-text-soft);
}

.hint-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-success);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-success) 20%, transparent);
  animation: pulse-ring 2.4s ease-out infinite;
}

.shortcut {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--c-text-muted);
}

kbd {
  padding: 1px 5px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--c-text-soft);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-bottom-width: 2px;
  border-radius: 5px;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.page-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 22px 0 6px;
  font-size: 11.5px;
  color: var(--c-text-muted);
}

.dot {
  opacity: 0.6;
}

/* ---------- 重置确认弹窗 ---------- */
.confirm-mask {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: 20px;
  background: color-mix(in srgb, var(--c-text) 42%, transparent);
  backdrop-filter: blur(4px);
}

.confirm-card {
  width: 100%;
  max-width: 350px;
  padding: 22px 22px 18px;
  text-align: center;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-pop);
  animation: pop-in var(--transition-slow) both;
}

.confirm-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  margin: 0 auto 10px;
  font-size: 22px;
  background: var(--c-surface-2);
  border-radius: 50%;
}

.confirm-title {
  font-size: 15.5px;
  font-weight: 700;
  color: var(--c-text);
}

.confirm-desc {
  margin-top: 5px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--c-text-muted);
}

.confirm-actions {
  display: flex;
  gap: 9px;
  margin-top: 18px;
}

.c-btn {
  flex: 1;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-pill);
  transition: transform var(--transition-fast), background var(--transition-fast);
}

.c-btn:active {
  transform: scale(0.97);
}

.c-btn.ghost {
  color: var(--c-text-soft);
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
}

.c-btn.ghost:hover {
  background: var(--c-bg-soft);
}

.c-btn.danger {
  color: #fff;
  background: var(--c-danger);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--c-danger) 34%, transparent);
}

@media (max-width: 980px) {
  .board {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .board-wrap {
    padding: 14px 16px 20px;
  }
}

@media (max-width: 560px) {
  .shortcut {
    display: none;
  }
}
</style>
