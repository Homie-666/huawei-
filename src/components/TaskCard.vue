<script setup>
import { computed, ref } from 'vue'
import { formatRelativeTime } from '../utils/timeFormat.ts'

const props = defineProps({
  task: { type: Object, required: true }
})

const emit = defineEmits(['toggle', 'remove', 'drag-start'])

const dragging = ref(false)

const isDone = computed(() => props.task.columnId === 'done')
const timeText = computed(() => formatRelativeTime(props.task.createdAt))
const initial = computed(() => (props.task.title || '?').trim().charAt(0).toUpperCase())

function onDragStart(event) {
  dragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.task.id)
  }
  emit('drag-start', props.task.id)
}

function onDragEnd() {
  dragging.value = false
}
</script>

<template>
  <article
    class="task-card"
    :class="{
      'is-urgent': task.urgent,
      'is-starred': task.starred,
      'is-done': isDone,
      'is-dragging': dragging
    }"
    draggable="true"
    data-task-card
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="card-head">
      <span v-if="task.category" class="tag">{{ task.category }}</span>
      <span v-else class="tag tag-ghost">未分类</span>

      <div class="actions">
        <button
          class="icon-btn"
          :class="{ 'is-on': task.starred }"
          :aria-pressed="task.starred"
          title="星标"
          @click.stop="emit('toggle', task.id, 'starred')"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path
              d="M12 3.6l2.62 5.31 5.86.85-4.24 4.13 1 5.84L12 16.98l-5.24 2.75 1-5.84L3.52 9.76l5.86-.85L12 3.6z"
              :fill="task.starred ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <button
          class="icon-btn"
          :class="{ 'is-on is-urgent': task.urgent }"
          :aria-pressed="task.urgent"
          title="紧急"
          @click.stop="emit('toggle', task.id, 'urgent')"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path
              d="M13 2.5L5.2 13.2h5.1l-.9 8.3 8.3-11.4h-5.2l.5-7.6z"
              :fill="task.urgent ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <button class="icon-btn is-danger" title="删除" @click.stop="emit('remove', task.id)">
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path
              d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0110.7 4h2.6a1.2 1.2 0 011.2 1.2V7m-8.1 0l.8 12a1.4 1.4 0 001.4 1.3h6.8a1.4 1.4 0 001.4-1.3l.8-12"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <h3 class="card-title">{{ task.title }}</h3>
    <p v-if="task.description" class="card-desc">{{ task.description }}</p>

    <footer class="card-foot">
      <span class="avatar">{{ initial }}</span>
      <span class="time">{{ timeText }}</span>
      <span v-if="task.urgent" class="badge-urgent">紧急</span>
      <span v-else-if="isDone" class="badge-done">已完成</span>
    </footer>
  </article>
</template>

<style scoped>
.task-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 13px 14px 11px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  cursor: grab;
  transition: transform var(--transition-fast), box-shadow var(--transition-base),
    border-color var(--transition-base), opacity var(--transition-fast);
  animation: fade-up var(--transition-slow) both;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  border-color: var(--c-border-strong);
}

.task-card:active {
  cursor: grabbing;
}

.task-card.is-dragging {
  opacity: 0.45;
  transform: rotate(1.4deg) scale(0.98);
  box-shadow: var(--shadow-hover);
}

.task-card.is-urgent {
  border-color: color-mix(in srgb, var(--c-danger) 55%, var(--c-border));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--c-danger) 22%, transparent),
    var(--shadow-card);
}

.task-card.is-urgent::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--c-danger);
}

.task-card.is-starred {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--c-warning) 7%, var(--c-surface)) 0%,
    var(--c-surface) 46%
  );
}

.task-card.is-done .card-title {
  color: var(--c-text-muted);
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
}

.task-card.is-done {
  opacity: 0.88;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: var(--c-primary);
  background: var(--c-primary-soft);
  border-radius: var(--radius-pill);
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-ghost {
  color: var(--c-text-muted);
  background: var(--c-surface-2);
  font-weight: 500;
}

.actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0.55;
  transition: opacity var(--transition-fast);
}

.task-card:hover .actions,
.actions:focus-within {
  opacity: 1;
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  color: var(--c-text-muted);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.icon-btn:hover {
  background: var(--c-surface-2);
  color: var(--c-text-soft);
}

.icon-btn.is-on {
  color: var(--c-warning);
}

.icon-btn.is-on.is-urgent {
  color: var(--c-danger);
}

.icon-btn.is-danger:hover {
  color: var(--c-danger);
  background: color-mix(in srgb, var(--c-danger) 12%, transparent);
}

.card-title {
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--c-text);
  word-break: break-word;
}

.card-desc {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--c-text-soft);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.card-foot {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 2px;
  padding-top: 8px;
  border-top: 1px dashed var(--c-border);
}

.avatar {
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--c-on-primary);
  background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
  border-radius: 50%;
  flex: none;
}

.time {
  font-size: 11.5px;
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}

.badge-urgent,
.badge-done {
  margin-left: auto;
  padding: 1px 7px;
  font-size: 10.5px;
  font-weight: 700;
  border-radius: var(--radius-pill);
  letter-spacing: 0.3px;
}

.badge-urgent {
  color: var(--c-danger);
  background: color-mix(in srgb, var(--c-danger) 12%, transparent);
}

.badge-done {
  color: var(--c-success);
  background: color-mix(in srgb, var(--c-success) 12%, transparent);
}
</style>
