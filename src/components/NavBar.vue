<script setup>
import { computed } from 'vue'
import ThemeSelector from './ThemeSelector.vue'
import { useRipple } from '../composables/useRipple.ts'

const props = defineProps({
  tasks: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-task', 'reset'])

const { createRipple } = useRipple()

const stats = computed(() => {
  const total = props.tasks.length
  const done = props.tasks.filter((task) => task.columnId === 'done').length
  const doing = props.tasks.filter((task) => task.columnId === 'doing').length
  const starred = props.tasks.filter((task) => task.starred).length
  const urgent = props.tasks.filter((task) => task.urgent).length

  return {
    total,
    done,
    doing,
    starred,
    urgent,
    progress: total ? Math.round((done / total) * 100) : 0
  }
})

function onAdd(event) {
  createRipple(event)
  emit('add-task')
}

function onReset(event) {
  createRipple(event)
  emit('reset')
}
</script>

<template>
  <header class="navbar">
    <div class="brand">
      <div class="logo">📋</div>
      <div class="brand-text">
        <h1 class="brand-title">任务管理看板</h1>
        <p class="brand-sub">拖拽流转 · 自动保存 · 三套皮肤</p>
      </div>
    </div>

    <div class="metrics">
      <div class="metric">
        <span class="metric-value">{{ stats.total }}</span>
        <span class="metric-label">总任务</span>
      </div>
      <span class="divider"></span>
      <div class="metric">
        <span class="metric-value is-primary">{{ stats.doing }}</span>
        <span class="metric-label">进行中</span>
      </div>
      <span class="divider"></span>
      <div class="metric">
        <span class="metric-value is-success">{{ stats.done }}</span>
        <span class="metric-label">已完成</span>
      </div>

      <div class="progress-wrap">
        <div class="progress-info">
          <span>完成度</span>
          <strong>{{ stats.progress }}%</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${stats.progress}%` }"></div>
        </div>
      </div>

      <div class="chips">
        <span v-if="stats.starred" class="chip is-star">★ {{ stats.starred }}</span>
        <span v-if="stats.urgent" class="chip is-urgent">● 紧急 {{ stats.urgent }}</span>
      </div>
    </div>

    <div class="actions">
      <ThemeSelector />
      <button class="btn ghost" type="button" @click="onReset">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path
            d="M4 12a8 8 0 108-8 8 8 0 00-6.3 3.1M4 4v4h4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        重置
      </button>
      <button class="btn primary" type="button" @click="onAdd">
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
          />
        </svg>
        新增任务
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  max-width: var(--layout-max);
  margin: 0 auto;
  padding: 14px 22px;
  background: color-mix(in srgb, var(--c-bg) 78%, transparent);
  backdrop-filter: blur(14px) saturate(140%);
  border-bottom: 1px solid var(--c-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  flex: none;
}

.logo {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  font-size: 19px;
  background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
  border-radius: var(--radius-md);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--c-primary) 32%, transparent);
}

.brand-title {
  font-size: 16.5px;
  font-weight: 750;
  letter-spacing: 0.3px;
  line-height: 1.25;
  color: var(--c-text);
}

.brand-sub {
  font-size: 11px;
  color: var(--c-text-muted);
  letter-spacing: 0.2px;
}

.metrics {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
  padding: 6px 14px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-card);
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.15;
  min-width: 32px;
}

.metric-value {
  font-size: 15px;
  font-weight: 750;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}

.metric-value.is-primary {
  color: var(--c-primary);
}

.metric-value.is-success {
  color: var(--c-success);
}

.metric-label {
  font-size: 10px;
  color: var(--c-text-muted);
  letter-spacing: 0.3px;
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--c-border);
}

.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 92px;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  color: var(--c-text-muted);
}

.progress-info strong {
  font-size: 11px;
  color: var(--c-primary);
  font-variant-numeric: tabular-nums;
}

.progress-track {
  height: 5px;
  border-radius: var(--radius-pill);
  background: var(--c-bg-soft);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-pill);
  background: linear-gradient(90deg, var(--c-primary), var(--c-accent));
  transition: width var(--transition-slow);
}

.chips {
  display: flex;
  gap: 5px;
}

.chip {
  padding: 1px 8px;
  font-size: 10.5px;
  font-weight: 700;
  border-radius: var(--radius-pill);
  white-space: nowrap;
}

.chip.is-star {
  color: var(--c-warning);
  background: color-mix(in srgb, var(--c-warning) 14%, transparent);
}

.chip.is-urgent {
  color: var(--c-danger);
  background: color-mix(in srgb, var(--c-danger) 13%, transparent);
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 15px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: var(--radius-pill);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast),
    background var(--transition-fast), color var(--transition-fast);
}

.btn:active {
  transform: scale(0.97);
}

.btn.ghost {
  color: var(--c-text-soft);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-card);
}

.btn.ghost:hover {
  color: var(--c-danger);
  border-color: color-mix(in srgb, var(--c-danger) 45%, var(--c-border));
}

.btn.primary {
  color: var(--c-on-primary);
  background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
  box-shadow: 0 6px 16px color-mix(in srgb, var(--c-primary) 34%, transparent);
}

.btn.primary:hover {
  box-shadow: 0 10px 24px color-mix(in srgb, var(--c-primary) 44%, transparent);
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .navbar {
    padding: 12px 16px;
    gap: 12px;
  }

  .metrics {
    order: 3;
    width: 100%;
    margin-left: 0;
    justify-content: space-between;
    border-radius: var(--radius-lg);
  }
}

@media (max-width: 560px) {
  .brand-sub {
    display: none;
  }

  .progress-wrap {
    display: none;
  }

  .btn.ghost span,
  .btn.ghost {
    padding: 0 11px;
  }
}
</style>
