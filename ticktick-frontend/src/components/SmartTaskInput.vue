<template>
  <div class="smart-task-input">
    <el-input
      v-model="text"
      :placeholder="placeholder"
      clearable
      @input="onInput"
      @keyup.enter="onEnter"
    />

    <div class="preview" v-if="parsed">
      <div class="title">{{ parsed.title }}</div>
      <div class="meta">
        <span v-if="parsed.dueAt">Due: {{ parsed.dueAt }}</span>
        <span v-if="parsed.priority">Priority: {{ parsed.priority }}</span>
        <span v-if="parsed.tagNames?.length">Tags: {{ parsed.tagNames.join(', ') }}</span>
      </div>
    </div>

    <div class="actions">
      <el-button type="primary" :disabled="!parsed" @click="onSubmit">Add Task</el-button>
      <el-button v-if="parsed" @click="clear">Clear</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type ParsedDraft = {
  title: string
  dueAt?: string
  startAt?: string
  priority?: number
  tagNames?: string[]
  repeatRule?: string
}

const props = defineProps<{
  parseNaturalLanguage: (text: string) => Promise<ParsedDraft>
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'add-task', task: ParsedDraft): void
}>()

const text = ref('')
const parsed = ref<ParsedDraft | null>(null)
const pending = ref(false)
const placeholder = props.placeholder || 'Type a task, e.g. "Pay rent tomorrow #home"'

async function onInput() {
  const value = text.value.trim()
  if (!value) {
    parsed.value = null
    return
  }
  pending.value = true
  try {
    parsed.value = await props.parseNaturalLanguage(value)
  } finally {
    pending.value = false
  }
}

function onEnter() {
  if (!parsed.value) return
  onSubmit()
}

function onSubmit() {
  if (!parsed.value) return
  emit('add-task', parsed.value)
  clear()
}

function clear() {
  text.value = ''
  parsed.value = null
}
</script>

<style scoped>
.smart-task-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.preview {
  padding: 10px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color-page);
}
.meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.actions {
  display: flex;
  gap: 8px;
}
</style>
