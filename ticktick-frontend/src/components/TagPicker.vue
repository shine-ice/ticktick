<template>
  <el-select
    :model-value="modelValue"
    multiple
    filterable
    collapse-tags
    placeholder="Select tags"
    @update:model-value="onUpdate"
    style="width: 100%"
  >
    <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id" />
  </el-select>
</template>

<script setup lang="ts">
import type { Tag } from '@/stores/types'

const props = defineProps<{
  modelValue: number[]
  tags: Tag[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

function onUpdate(val: number[]) {
  emit('update:modelValue', val)
}
</script>
