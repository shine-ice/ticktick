<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-input v-model="name" placeholder="Habit name" style="width: 200px" />
      <el-select v-model="schedule" placeholder="Schedule" style="width: 140px">
        <el-option value="DAILY" label="Daily" />
        <el-option value="WEEKLY" label="Weekly" />
      </el-select>
      <el-input-number v-model="target" :min="1" />
      <el-input v-model="unit" placeholder="Unit" style="width: 120px" />
      <el-button type="primary" @click="create">Create</el-button>
      <el-button @click="refresh">Refresh</el-button>
    </div>

    <el-table :data="habits.items" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="schedule" label="Schedule" width="120" />
      <el-table-column prop="target" label="Target" width="100" />
      <el-table-column prop="unit" label="Unit" width="100" />
      <el-table-column label="Actions" width="220">
        <template #default="{ row }">
          <el-button size="small" @click="log(row)">Log today</el-button>
          <el-button size="small" type="danger" @click="remove(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useHabitsStore } from '@/stores/habits'

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

async function log(row: any) {
  const today = new Date().toISOString().slice(0, 10)
  await habits.log(row.id, { date: today, value: 1 })
}

async function remove(row: any) {
  await ElMessageBox.confirm(`Delete habit "${row.name}"?`, 'Confirm', { type: 'warning' })
  await habits.remove(row.id)
}
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
