<template>
  <div class="smart-task-input">
    <div class="input-row">
      <el-input
        v-model="text"
        :placeholder="placeholder"
        clearable
        @input="onInput"
        @keyup.enter="onEnter"
      />
      <el-button type="primary" :loading="pending" :disabled="!parsed" @click="onSubmit">Add</el-button>
    </div>

    <div class="preview" v-if="parsed">
      <div class="title">{{ parsed.title }}</div>
      <div class="meta">
        <el-tag v-if="parsed.dueAt" size="small" effect="plain">Due {{ parsed.dueAt }}</el-tag>
        <el-tag v-if="parsed.priority" size="small" type="danger">P{{ parsed.priority }}</el-tag>
        <el-tag v-for="tag in parsed.tagNames || []" :key="tag" size="small" type="info" effect="plain">
          #{{ tag }}
        </el-tag>
      </div>
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
.input-row {
  display: flex;
  gap: 10px;
}
.preview {
  padding: 10px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color-page);
}
.title {
  font-weight: 600;
  margin-bottom: 6px;
}
.meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
