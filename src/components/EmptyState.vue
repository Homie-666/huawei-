<script setup>
defineProps({
  icon: { type: String, default: '🗂️' },
  title: { type: String, default: '这里还空着' },
  hint: { type: String, default: '把任务拖进来，或者新建一个' },
  actionText: { type: String, default: '' },
  actionIcon: { type: String, default: '＋' }
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="empty">
    <div class="bubble">
      <span class="bubble-icon">{{ icon }}</span>
      <span class="bubble-ring"></span>
    </div>
    <p class="empty-title">{{ title }}</p>
    <p class="empty-hint">{{ hint }}</p>
    <button v-if="actionText" class="empty-btn" type="button" @click="emit('action')">
      <span class="plus">{{ actionIcon }}</span>
      {{ actionText }}
    </button>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 34px 14px 30px;
  text-align: center;
  border: 1.5px dashed var(--c-border-strong);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--c-surface) 45%, transparent);
  transition: border-color var(--transition-base), background var(--transition-base);
}

.bubble {
  position: relative;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 4px;
  border-radius: 50%;
  background: var(--c-surface);
  box-shadow: var(--shadow-card);
}

.bubble-icon {
  font-size: 24px;
  line-height: 1;
  animation: float-y 3.4s ease-in-out infinite;
}

.bubble-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px dashed var(--c-border-strong);
  opacity: 0.9;
}

.empty-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-soft);
}

.empty-hint {
  font-size: 12px;
  color: var(--c-text-muted);
  max-width: 190px;
  line-height: 1.5;
}

.empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 6px 13px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-primary);
  background: var(--c-primary-soft);
  border-radius: var(--radius-pill);
  transition: transform var(--transition-fast), background var(--transition-fast);
}

.empty-btn:hover {
  background: color-mix(in srgb, var(--c-primary) 20%, transparent);
  transform: translateY(-1px);
}

.plus {
  font-size: 13px;
  line-height: 1;
}
</style>
