<script setup>
import { useToast } from '../composables/useToast.ts'

const { toasts, pause, resume } = useToast()

const icons = {
  success: '✓',
  error: '!',
  info: 'i'
}
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-stack">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`is-${toast.type}`"
        @mouseenter="pause(toast.id)"
        @mouseleave="resume(toast.id)"
      >
        <span class="toast-icon">{{ icons[toast.type] }}</span>
        <p class="toast-msg">{{ toast.message }}</p>
        <div class="toast-bar">
          <span
            :style="{
              animationDuration: `${toast.duration}ms`,
              animationPlayState: toast.paused ? 'paused' : 'running'
            }"
          ></span>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: 9px;
  align-items: flex-end;
  pointer-events: none;
}

.toast {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 210px;
  max-width: 330px;
  padding: 10px 14px 12px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-pop);
  overflow: hidden;
  pointer-events: auto;
  animation: toast-in 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(28px) scale(0.96);
  }
}

.toast-icon {
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  border-radius: 50%;
  flex: none;
}

.toast.is-success .toast-icon {
  background: var(--c-success);
}

.toast.is-error .toast-icon {
  background: var(--c-danger);
}

.toast.is-info .toast-icon {
  background: var(--c-primary);
}

.toast-msg {
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--c-text);
}

.toast-bar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2.5px;
  width: 100%;
  background: var(--c-bg-soft);
}

.toast-bar span {
  display: block;
  height: 100%;
  width: 100%;
  border-radius: 0 2px 2px 0;
  background: linear-gradient(90deg, var(--c-primary), var(--c-accent));
  animation-name: bar-shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.toast.is-success .toast-bar span {
  background: linear-gradient(90deg, var(--c-success), var(--c-primary));
}

.toast.is-error .toast-bar span {
  background: linear-gradient(90deg, var(--c-danger), var(--c-warning));
}

@keyframes bar-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@media (max-width: 560px) {
  .toast-stack {
    right: 12px;
    left: 12px;
    bottom: 14px;
    align-items: stretch;
  }

  .toast {
    max-width: none;
  }
}
</style>
