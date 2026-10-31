<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from '../composables/useTheme.ts'

const { themes, currentId, setTheme, preview, cancelPreview } = useTheme()

const open = ref(false)
const rootRef = ref(null)

const currentTheme = computed(
  () => themes.find((theme) => theme.id === currentId.value) || themes[0]
)

function toggle() {
  open.value = !open.value
  if (!open.value) cancelPreview()
}

function choose(id) {
  setTheme(id)
  open.value = false
}

function onEnter(id) {
  if (open.value) preview(id)
}

function onLeave() {
  cancelPreview()
}

function onDocumentClick(event) {
  if (!open.value) return
  if (rootRef.value && !rootRef.value.contains(event.target)) {
    open.value = false
    cancelPreview()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="rootRef" class="theme-selector">
    <button
      class="trigger"
      :class="{ 'is-open': open }"
      type="button"
      aria-haspopup="listbox"
      :aria-expanded="open"
      title="切换主题"
      @click.stop="toggle"
    >
      <span class="trigger-icon">{{ currentTheme.icon }}</span>
      <span class="trigger-name">{{ currentTheme.name }}</span>
      <svg class="caret" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
        <path
          d="M6 9.5l6 6 6-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <Transition name="drop">
      <ul v-if="open" class="menu" role="listbox">
        <li v-for="theme in themes" :key="theme.id">
          <button
            class="item"
            :class="{ 'is-active': theme.id === currentId }"
            type="button"
            role="option"
            :aria-selected="theme.id === currentId"
            @mouseenter="onEnter(theme.id)"
            @mouseleave="onLeave"
            @click.stop="choose(theme.id)"
          >
            <span class="swatches" :style="{ background: theme.variables['--c-bg'] }">
              <i :style="{ background: theme.variables['--c-primary'] }"></i>
              <i :style="{ background: theme.variables['--c-accent'] }"></i>
              <i :style="{ background: theme.variables['--c-success'] }"></i>
            </span>
            <span class="item-text">
              <span class="item-name">{{ theme.icon }} {{ theme.name }}</span>
              <span class="item-desc">{{ theme.dark ? '深色界面' : '浅色界面' }}</span>
            </span>
            <svg
              v-if="theme.id === currentId"
              class="check"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              aria-hidden="true"
            >
              <path
                d="M5 12.5l4.5 4.5L19 7"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </li>
        <li class="menu-tip">悬停可实时预览</li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.theme-selector {
  position: relative;
}

.trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-text-soft);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-card);
  transition: border-color var(--transition-fast), color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.trigger:hover,
.trigger.is-open {
  color: var(--c-text);
  border-color: var(--c-border-strong);
  box-shadow: var(--shadow-hover);
}

.trigger-icon {
  font-size: 13px;
}

.caret {
  color: var(--c-text-muted);
  transition: transform var(--transition-fast);
}

.trigger.is-open .caret {
  transform: rotate(180deg);
}

.menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: var(--z-dropdown);
  width: 208px;
  padding: 6px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-pop);
}

.item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 7px 8px;
  border-radius: 9px;
  text-align: left;
  transition: background var(--transition-fast);
}

.item:hover {
  background: var(--c-surface-2);
}

.item.is-active {
  background: var(--c-primary-soft);
}

.swatches {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  width: 28px;
  height: 28px;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--c-border);
  flex: none;
}

.swatches i {
  border-radius: 50%;
}

.item-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.item-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-text);
}

.item-desc {
  font-size: 10.5px;
  color: var(--c-text-muted);
}

.check {
  color: var(--c-primary);
  flex: none;
}

.menu-tip {
  padding: 4px 8px 2px;
  font-size: 10.5px;
  color: var(--c-text-muted);
  text-align: center;
}
</style>
