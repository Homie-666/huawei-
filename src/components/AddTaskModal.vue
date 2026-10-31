<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'

const props = defineProps({
  columns: { type: Array, default: () => [] },
  existingCategories: { type: Array, default: () => [] },
  defaultColumn: { type: String, default: 'todo' }
})

const emit = defineEmits(['submit', 'close'])

const form = reactive({
  title: '',
  description: '',
  category: '',
  columnId: props.defaultColumn,
  starred: false,
  urgent: false
})

const error = ref('')
const titleRef = ref(null)
const touchedCategory = ref(false)

const filteredCategories = computed(() => {
  const keyword = form.category.trim().toLowerCase()
  return props.existingCategories
    .filter((item) => item !== form.category.trim())
    .filter((item) => !keyword || item.toLowerCase().includes(keyword))
    .slice(0, 6)
})

function pickCategory(name) {
  form.category = name
  touchedCategory.value = true
}

function toggleFlag(field) {
  form[field] = !form[field]
}

function submit() {
  const title = form.title.trim()
  if (!title) {
    error.value = '任务标题不能为空'
    titleRef.value?.focus()
    return
  }
  error.value = ''
  emit('submit', {
    title,
    description: form.description.trim(),
    category: form.category.trim(),
    columnId: form.columnId,
    starred: form.starred,
    urgent: form.urgent
  })
}

function close() {
  emit('close')
}

function onTitleInput() {
  if (error.value) error.value = ''
}

onMounted(() => {
  nextTick(() => titleRef.value?.focus())
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-mask" @click.self="close" @keydown.esc="close">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header class="modal-head">
          <div class="head-text">
            <h2 id="modal-title" class="modal-title">新建任务</h2>
            <p class="modal-sub">一句话说清楚要做什么，剩下的交给看板</p>
          </div>
          <button class="close-btn" type="button" title="关闭" @click="close">
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>

        <form class="modal-body" @submit.prevent="submit">
          <div class="field" :class="{ 'is-invalid': error }">
            <input
              id="task-title"
              ref="titleRef"
              v-model="form.title"
              type="text"
              maxlength="60"
              placeholder=" "
              autocomplete="off"
              @input="onTitleInput"
            />
            <label for="task-title">任务标题 <em>*</em></label>
            <p v-if="error" class="error-text">{{ error }}</p>
          </div>

          <div class="field field-area">
            <textarea
              id="task-desc"
              v-model="form.description"
              rows="3"
              maxlength="200"
              placeholder=" "
            ></textarea>
            <label for="task-desc">描述（可选）</label>
            <span class="counter">{{ form.description.length }}/200</span>
          </div>

          <div class="field">
            <input
              id="task-category"
              v-model="form.category"
              type="text"
              maxlength="12"
              placeholder=" "
              autocomplete="off"
              @input="touchedCategory = true"
            />
            <label for="task-category">分类（可选）</label>
          </div>

          <div v-if="touchedCategory && filteredCategories.length" class="suggest">
            <span class="suggest-label">已有分类</span>
            <button
              v-for="name in filteredCategories"
              :key="name"
              class="suggest-chip"
              type="button"
              @click="pickCategory(name)"
            >
              {{ name }}
            </button>
          </div>

          <div class="group">
            <span class="group-label">放到哪一列</span>
            <div class="segmented">
              <button
                v-for="column in columns"
                :key="column.id"
                type="button"
                class="seg-btn"
                :class="{ 'is-active': form.columnId === column.id }"
                @click="form.columnId = column.id"
              >
                <span class="seg-icon">{{ column.icon }}</span>
                {{ column.title }}
              </button>
            </div>
          </div>

          <div class="group">
            <span class="group-label">标记</span>
            <div class="flags">
              <button
                type="button"
                class="flag-btn"
                :class="{ 'is-on': form.starred }"
                @click="toggleFlag('starred')"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path
                    d="M12 3.6l2.62 5.31 5.86.85-4.24 4.13 1 5.84L12 16.98l-5.24 2.75 1-5.84L3.52 9.76l5.86-.85L12 3.6z"
                    :fill="form.starred ? 'currentColor' : 'none'"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linejoin="round"
                  />
                </svg>
                星标
              </button>
              <button
                type="button"
                class="flag-btn is-urgent"
                :class="{ 'is-on': form.urgent }"
                @click="toggleFlag('urgent')"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path
                    d="M13 2.5L5.2 13.2h5.1l-.9 8.3 8.3-11.4h-5.2l.5-7.6z"
                    :fill="form.urgent ? 'currentColor' : 'none'"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
                紧急
              </button>
            </div>
          </div>
        </form>

        <footer class="modal-foot">
          <button class="btn ghost" type="button" @click="close">取消</button>
          <button class="btn primary" type="button" @click="submit">创建任务</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: 20px;
  background: color-mix(in srgb, var(--c-text) 42%, transparent);
  backdrop-filter: blur(4px);
  animation: fade-in-mask var(--transition-base) both;
}

@keyframes fade-in-mask {
  from {
    opacity: 0;
  }
}

.modal-card {
  width: 100%;
  max-width: 470px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-pop);
  animation: pop-in var(--transition-slow) both;
  overflow: hidden;
}

.modal-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 20px 12px;
}

.head-text {
  flex: 1;
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.modal-sub {
  margin-top: 2px;
  font-size: 12.5px;
  color: var(--c-text-muted);
}

.close-btn {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  color: var(--c-text-muted);
  border-radius: 9px;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.close-btn:hover {
  color: var(--c-text);
  background: var(--c-surface-2);
}

.modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 20px 6px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ---------- 浮动标签输入框 ---------- */
.field {
  position: relative;
}

.field input,
.field textarea {
  width: 100%;
  padding: 20px 12px 8px;
  font-size: 14px;
  color: var(--c-text);
  background: var(--c-surface-2);
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--transition-fast), background var(--transition-fast),
    box-shadow var(--transition-fast);
}

.field textarea {
  resize: none;
  line-height: 1.55;
}

.field input:hover,
.field textarea:hover {
  border-color: var(--c-border-strong);
}

.field input:focus,
.field textarea:focus {
  background: var(--c-surface);
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-soft);
}

.field label {
  position: absolute;
  left: 13px;
  top: 16px;
  font-size: 13.5px;
  color: var(--c-text-muted);
  pointer-events: none;
  transform-origin: left top;
  transition: transform var(--transition-fast), color var(--transition-fast),
    top var(--transition-fast), font-size var(--transition-fast);
}

.field input:focus + label,
.field input:not(:placeholder-shown) + label,
.field textarea:focus + label,
.field textarea:not(:placeholder-shown) + label {
  top: 7px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: var(--c-primary);
}

.field label em {
  font-style: normal;
  color: var(--c-danger);
}

.field.is-invalid input {
  border-color: var(--c-danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-danger) 14%, transparent);
}

.field.is-invalid label {
  color: var(--c-danger);
}

.error-text {
  margin-top: 5px;
  padding-left: 3px;
  font-size: 11.5px;
  color: var(--c-danger);
}

.counter {
  position: absolute;
  right: 11px;
  bottom: 7px;
  font-size: 10.5px;
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}

/* ---------- 分类建议 ---------- */
.suggest {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: -6px;
}

.suggest-label {
  font-size: 11px;
  color: var(--c-text-muted);
}

.suggest-chip {
  padding: 3px 9px;
  font-size: 11.5px;
  color: var(--c-text-soft);
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-pill);
  transition: all var(--transition-fast);
}

.suggest-chip:hover {
  color: var(--c-primary);
  border-color: var(--c-primary);
  background: var(--c-primary-soft);
}

/* ---------- 分组 ---------- */
.group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.group-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--c-text-muted);
  letter-spacing: 0.3px;
}

.segmented {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
}

.seg-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-text-soft);
  border-radius: 9px;
  transition: background var(--transition-fast), color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.seg-btn.is-active {
  color: var(--c-primary);
  background: var(--c-surface);
  box-shadow: var(--shadow-card);
}

.seg-icon {
  font-size: 12px;
}

.flags {
  display: flex;
  gap: 8px;
}

.flag-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 13px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-text-soft);
  background: var(--c-surface-2);
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-pill);
  transition: all var(--transition-fast);
}

.flag-btn:hover {
  border-color: var(--c-border-strong);
}

.flag-btn.is-on {
  color: var(--c-warning);
  border-color: color-mix(in srgb, var(--c-warning) 55%, transparent);
  background: color-mix(in srgb, var(--c-warning) 12%, transparent);
}

.flag-btn.is-urgent.is-on {
  color: var(--c-danger);
  border-color: color-mix(in srgb, var(--c-danger) 55%, transparent);
  background: color-mix(in srgb, var(--c-danger) 12%, transparent);
}

/* ---------- 底部 ---------- */
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px 18px;
  border-top: 1px solid var(--c-border);
  background: var(--c-surface);
}

.btn {
  padding: 9px 20px;
  font-size: 13.5px;
  font-weight: 600;
  border-radius: var(--radius-pill);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast),
    background var(--transition-fast);
}

.btn:active {
  transform: scale(0.97);
}

.btn.ghost {
  color: var(--c-text-soft);
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
}

.btn.ghost:hover {
  background: var(--c-bg-soft);
}

.btn.primary {
  color: var(--c-on-primary);
  background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
  box-shadow: 0 6px 16px color-mix(in srgb, var(--c-primary) 32%, transparent);
}

.btn.primary:hover {
  box-shadow: 0 9px 22px color-mix(in srgb, var(--c-primary) 42%, transparent);
}
</style>
