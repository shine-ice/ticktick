<template>
  <div class="habits-view">
    <el-card class="tt-card">
      <div class="header">
        <div>
          <div class="tt-section-title">Habits</div>
          <div class="tt-subtle">Build streaks with small daily wins</div>
        </div>
        <div class="actions">
          <el-input v-model="name" placeholder="Habit name" class="name-input" />
          <el-select v-model="schedule" placeholder="Schedule" class="select">
            <el-option value="DAILY" label="Daily" />
            <el-option value="WEEKLY" label="Weekly" />
          </el-select>
          <el-input-number v-model="target" :min="1" />
          <el-input v-model="unit" placeholder="Unit" class="unit-input" />
          <el-button type="primary" @click="create">Create</el-button>
          <el-button @click="refresh">Refresh</el-button>
        </div>
      </div>
    </el-card>

    <div class="habit-grid">
      <el-card v-for="habit in habits.items" :key="habit.id" class="tt-card habit-card">
        <div class="habit-head">
          <div>
            <div class="habit-name">{{ habit.name }}</div>
            <div class="habit-meta">{{ habit.schedule }} · Target {{ habit.target || 1 }} {{ habit.unit || '' }}</div>
          </div>
          <div class="habit-actions">
            <el-button size="small" type="primary" plain @click="log(habit)">Log today</el-button>
            <el-button size="small" text type="danger" @click="remove(habit)">Delete</el-button>
          </div>
        </div>
        <div class="habit-progress">
          <el-progress :percentage="progressFor(habit)" />
          <div class="progress-meta">{{ progressLabel(habit) }}</div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useHabitsStore } from '@/stores/habits'
import type { Habit } from '@/stores/types'

const habits = useHabitsStore()
const name = ref('')
const schedule = ref('DAILY')
const target = ref(1)
const unit = ref('')

onMounted(async () => {
  await habits.fetchAll()
})

async function refresh() {
  await habits.fetchAll()
}

async function create() {
  const n = name.value.trim()
  if (!n) return
  await habits.create({ name: n, schedule: schedule.value, target: target.value, unit: unit.value || undefined })
  name.value = ''
}

async function log(row: Habit) {
  const today = new Date().toISOString().slice(0, 10)
  await habits.log(row.id, { date: today, value: 1 })
}

function progressFor(_habit: Habit) {
  // TODO: backend lacks an endpoint to read habit logs and streak data for progress visualization.
  return 0
}

function progressLabel(habit: Habit) {
  return `0 / ${habit.target || 1} ${habit.unit || ''}`.trim()
}

async function remove(row: Habit) {
  await ElMessageBox.confirm(`Delete habit "${row.name}"?`, 'Confirm', { type: 'warning' })
  await habits.remove(row.id)
}
</script>

<style scoped>
.habits-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.name-input {
  width: 200px;
}
.unit-input {
  width: 120px;
}
.select {
  width: 140px;
}
.habit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
.habit-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.habit-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.habit-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.habit-name {
  font-weight: 600;
  font-size: 16px;
}
.habit-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.habit-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.progress-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
