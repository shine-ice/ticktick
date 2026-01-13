<template>
  <el-drawer :model-value="modelValue" title="Edit Task" size="420px" @close="close">
    <el-form label-position="top">
      <el-form-item label="Title">
        <el-input v-model="draft.title" />
      </el-form-item>
      <el-form-item label="Note">
        <el-input v-model="draft.note" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="Due date">
        <el-date-picker v-model="draft.dueAt" type="datetime" />
      </el-form-item>
      <el-form-item label="Priority">
        <el-select v-model="draft.priority">
          <el-option :value="0" label="None" />
          <el-option :value="1" label="Low" />
          <el-option :value="2" label="Medium" />
          <el-option :value="3" label="High" />
        </el-select>
      </el-form-item>
      <el-form-item label="Tags">
        <TagPicker v-model="draft.tagIds" :tags="tags" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">Cancel</el-button>
      <el-button type="primary" @click="save">Save</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import TagPicker from './TagPicker.vue'
import type { Tag, Task } from '@/stores/types'

const props = defineProps<{
  modelValue: boolean
  task: Task | null
  tags: Tag[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', patch: any): void
}>()

const draft = reactive({
  title: '',
  note: '',
  dueAt: null as any,
  priority: 0,
  tagIds: [] as number[]
})

watch(
  () => props.task,
  (task) => {
    if (!task) return
    draft.title = task.title || ''
    draft.note = task.note || ''
    draft.dueAt = task.due_at || null
    draft.priority = task.priority ?? 0
    draft.tagIds = Array.isArray(task.tagIds) ? [...task.tagIds] : []
  },
  { immediate: true }
)

function close() {
  emit('update:modelValue', false)
}

function save() {
  emit('save', {
    title: draft.title,
    note: draft.note,
    dueAt: draft.dueAt,
    priority: draft.priority,
    tagIds: draft.tagIds
  })
  close()
}
</script>
