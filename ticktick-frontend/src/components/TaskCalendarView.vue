<template>
  <div class="calendar-view">
    <el-calendar v-model="selectedDate">
      <template #date-cell="{ data }">
        <div class="cell">
          <div class="day">{{ data.day }}</div>
          <div class="badges">
            <el-tag v-if="countByDate(data.date)" size="small">{{ countByDate(data.date) }}</el-tag>
          </div>
        </div>
      </template>
    </el-calendar>

    <el-divider />

    <div class="task-list">
      <div class="title">Tasks on {{ selectedDate.toDateString() }}</div>
      <el-empty v-if="filtered.length === 0" description="No tasks" />
      <div v-else class="rows">
        <div v-for="task in filtered" :key="task.id" class="task-row">
          <span>{{ task.title }}</span>
          <el-tag v-if="task.priority" size="small">P{{ task.priority }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task } from '@/stores/types'

const props = defineProps<{
  tasks: Task[]
}>()

const selectedDate = ref(new Date())

const filtered = computed(() => {
  const day = selectedDate.value.toISOString().slice(0, 10)
  return props.tasks.filter((t) => (t.due_at || '').startsWith(day))
})

function countByDate(date: Date) {
  const day = date.toISOString().slice(0, 10)
  return props.tasks.filter((t) => (t.due_at || '').startsWith(day)).length
}
</script>

<style scoped>
.calendar-view {
  display: grid;
  gap: 16px;
}
.cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.task-list .title {
  font-weight: 600;
  margin-bottom: 8px;
}
.task-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--el-border-color-light);
}
.rows .task-row:last-child {
  border-bottom: none;
}
</style>
