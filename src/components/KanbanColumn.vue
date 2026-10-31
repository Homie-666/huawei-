<script setup>
import { ref } from 'vue'
import TaskCard from './TaskCard.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  column: { type: Object, required: true },
  taskList: { type: Array, default: () => [] }
})

const emit = defineEmits(['move', 'toggle', 'remove', 'add', 'drag-start'])

const isOver = ref(false)
const dropIndex = ref(-1)
const listRef = ref(null)

function calculateIndex(event) {
  const cards = Array.from(listRef.value?.querySelectorAll('[data-task-card]') || [])
  let index = cards.length
  for (let i = 0; i < cards.length; i += 1) {
    const rect = cards[i].getBoundingClientRect()
    if (event.clientY < rect.top + rect.height / 2) {
      index = i
      break
    }
  }
  return index
}

function onDragEnter(event) {
  event.preventDefault()
  isOver.value = true
}

function onDragOver(event) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  isOver.value = true
  dropIndex.value = calculateIndex(event)
}

function onDragLeave(event) {
  if (event.currentTarget.contains(event.relatedTarget)) return
  isOver.value = false
  dropIndex.value = -1
}

function onDrop(event) {
  event.preventDefault()
  const taskId = event.dataTransfer ? event.dataTransfer.getData('text/plain') : ''
  const index = dropIndex.value < 0 ? props.taskList.length : dropIndex.value

  isOver.value = false
  dropIndex.value = -1

  if (taskId) emit('move', taskId, props.column.id, index)
}
</script>

<template>
  <section
    class="column"
    :class="{ 'is-over': isOver }"
    :style="{ '--col-color': column.color }"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <header class="col-head">
      <span class="col-dot"></span>
      <span class="col-icon">{{ column.icon }}</span>
      <h2 class="col-title">{{ column.title }}</h2>
      <span class="col-count">{{ taskList.length }}</span>
      <button class="col-add" type="button" title="在该列新建任务" @click="emit('add', column.id)">
        ＋
      </button>
    </header>

    <div ref="listRef" class="col-body">
      <div class="card-list">
        <template v-for="(task, index) in taskList" :key="task.id">
          <div v-if="dropIndex === index" class="drop-line"></div>
          <TaskCard
            :task="task"
            @toggle="(id, field) => emit('toggle', id, field)"
            @remove="(id) => emit('remove', id)"
            @drag-start="(id) => emit('drag-start', id)"
          />
        </template>
        <div v-if="dropIndex === taskList.length" class="drop-line"></div>
      </div>

      <EmptyState
        v-if="!taskList.length && !isOver"
        :icon="column.icon"
        title="这列还空着"
        hint="把卡片拖进来，或者直接新建一个任务"
        action-text="新建任务"
        @action="emit('add', column.id)"
      />
    </div>
  </section>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  min-height: 340px;
  max-height: calc(100vh - 208px);
  padding: 12px;
  background: var(--c-column-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
  transition: border-color var(--transition-base), background var(--transition-base),
    box-shadow var(--transition-base);
}

.column.is-over {
  border-color: color-mix(in srgb, var(--col-color) 60%, var(--c-border));
  background: color-mix(in srgb, var(--col-color) 7%, var(--c-column-bg));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--col-color) 26%, transparent);
}

.col-head {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 2px 4px 10px;
}

.col-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--col-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--col-color) 20%, transparent);
  flex: none;
}

.col-icon {
  font-size: 13px;
  line-height: 1;
}

.col-title {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--c-text);
}

.col-count {
  min-width: 20px;
  padding: 0 6px;
  font-size: 11.5px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  color: var(--c-text-soft);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-pill);
  font-variant-numeric: tabular-nums;
}

.col-add {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  font-size: 12px;
  color: var(--c-text-muted);
  border-radius: 6px;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.col-add:hover {
  color: var(--col-color);
  background: color-mix(in srgb, var(--col-color) 14%, transparent);
}

.col-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;
  margin-right: -2px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-height: 100%;
}

.drop-line {
  position: relative;
  height: 3px;
  border-radius: 3px;
  background: var(--col-color);
  opacity: 0.75;
  animation: pop-in 160ms ease-out;
}

.drop-line::before {
  content: '';
  position: absolute;
  left: -3px;
  top: -2px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--col-color);
}

@media (max-width: 980px) {
  .column {
    max-height: none;
    min-height: 220px;
  }

  .col-body {
    overflow: visible;
  }
}
</style>
