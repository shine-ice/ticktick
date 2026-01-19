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
    <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id">
      <span class="tag-option">
        <span class="tag-dot" :style="{ background: tag.color || '#cbd5f5' }" />
        <span>{{ tag.name }}</span>
      </span>
    </el-option>
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

<style scoped>
.tag-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.tag-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
