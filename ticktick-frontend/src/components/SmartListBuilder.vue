<template>
  <el-form label-position="top">
    <el-form-item label="Status">
      <el-select v-model="local.status" placeholder="Any">
        <el-option value="all" label="All" />
        <el-option value="active" label="Active" />
        <el-option value="completed" label="Completed" />
      </el-select>
    </el-form-item>
    <el-form-item label="Due">
      <el-select v-model="local.due" placeholder="Any">
        <el-option value="any" label="Any" />
        <el-option value="today" label="Today" />
        <el-option value="overdue" label="Overdue" />
        <el-option value="next7" label="Next 7 days" />
        <el-option value="none" label="No due date" />
      </el-select>
    </el-form-item>
    <el-form-item label="Min priority">
      <el-input-number v-model="local.priorityGte" :min="0" :max="3" />
    </el-form-item>
    <el-form-item label="Keyword">
      <el-input v-model="local.keyword" placeholder="Search title" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const local = reactive<any>({
  status: 'all',
  due: 'any',
  priorityGte: 0,
  keyword: ''
})

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(local, val || {})
  },
  { immediate: true }
)

watch(
  local,
  () => {
    emit('update:modelValue', { ...local })
  },
  { deep: true }
)
</script>
