<template>
  <div class="lists-view">
    <el-card class="tt-card">
      <div class="header">
        <div>
          <div class="tt-section-title">Lists</div>
          <div class="tt-subtle">Group tasks by project, area, or goal</div>
        </div>
        <div class="actions">
          <el-input v-model="name" placeholder="New list name" class="name-input" />
          <el-color-picker v-model="color" />
          <el-button type="primary" @click="create">Create</el-button>
          <el-button @click="refresh">Refresh</el-button>
        </div>
      </div>
    </el-card>

    <div class="list-grid">
      <el-card v-for="list in lists.items" :key="list.id" class="tt-card list-item">
        <div class="list-row">
          <span class="list-dot" :style="{ background: list.color || '#fca5a5' }" />
          <div class="list-info">
            <div class="list-name">{{ list.name }}</div>
            <div class="list-meta">{{ countFor(list.id) }} tasks</div>
          </div>
        </div>
        <div class="list-actions">
          <el-button size="small" text @click="rename(list)">Rename</el-button>
          <el-button size="small" text type="danger" @click="remove(list)">Delete</el-button>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="renameVisible" title="Rename list" width="420px">
      <el-input v-model="renameText" />
      <template #footer>
        <el-button @click="renameVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmRename">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useListsStore } from '@/stores/lists'
import { useTasksStore } from '@/stores/tasks'

const lists = useListsStore()
const tasks = useTasksStore()
const name = ref('')
const color = ref<string | null>('#ff4d4f')

const renameVisible = ref(false)
const renameId = ref<number | null>(null)
const renameText = ref('')

onMounted(async () => {
  await lists.fetchAll()
  if (!tasks.items.length) {
    await tasks.fetchList(1, 100)
  }
})

function countFor(listId: number) {
  return tasks.items.filter((task) => task.list_id === listId && task.is_completed !== 1).length
}

async function refresh() {
  await lists.fetchAll()
}

async function create() {
  const n = name.value.trim()
  if (!n) return
  await lists.create({ name: n, color: color.value || undefined })
  name.value = ''
}

function rename(row: any) {
  renameId.value = row.id
  renameText.value = row.name
  renameVisible.value = true
}

async function confirmRename() {
  if (!renameId.value) return
  await lists.patch(renameId.value, { name: renameText.value.trim() })
  renameVisible.value = false
}

async function remove(row: any) {
  await ElMessageBox.confirm(`Delete list "${row.name}"?`, 'Confirm', { type: 'warning' })
  await lists.remove(row.id)
}
</script>

<style scoped>
.lists-view {
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
  width: 220px;
}
.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.list-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.list-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.list-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.list-name {
  font-weight: 600;
}
.list-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.list-actions {
  display: flex;
  gap: 8px;
}
</style>
