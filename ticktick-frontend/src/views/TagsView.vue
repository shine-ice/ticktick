<template>
  <div class="tags-view">
    <el-card class="tt-card">
      <div class="header">
        <div>
          <div class="tt-section-title">Tags</div>
          <div class="tt-subtle">Add context like @home or #deepwork</div>
        </div>
        <div class="actions">
          <el-input v-model="name" placeholder="New tag name" class="name-input" />
          <el-color-picker v-model="color" />
          <el-button type="primary" @click="create">Create</el-button>
          <el-button @click="refresh">Refresh</el-button>
        </div>
      </div>
    </el-card>

    <div class="tag-grid">
      <el-card v-for="tag in tags.items" :key="tag.id" class="tt-card tag-item">
        <div class="tag-row">
          <span class="tag-dot" :style="{ background: tag.color || '#93c5fd' }" />
          <div class="tag-info">
            <div class="tag-name">#{{ tag.name }}</div>
            <div class="tag-meta">{{ countFor(tag.id) }} tasks</div>
          </div>
        </div>
        <div class="tag-actions">
          <el-button size="small" text @click="rename(tag)">Rename</el-button>
          <el-button size="small" text type="danger" @click="remove(tag)">Delete</el-button>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="renameVisible" title="Rename tag" width="420px">
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
import { useTagsStore } from '@/stores/tags'
import { useTasksStore } from '@/stores/tasks'

const tags = useTagsStore()
const tasks = useTasksStore()
const name = ref('')
const color = ref<string | null>('#60a5fa')

const renameVisible = ref(false)
const renameId = ref<number | null>(null)
const renameText = ref('')

onMounted(async () => {
  await tags.fetchAll()
  if (!tasks.items.length) {
    await tasks.fetchList(1, 100)
  }
})

function countFor(tagId: number) {
  return tasks.items.filter((task) => (task.tagIds || []).includes(tagId) && task.is_completed !== 1).length
}

async function refresh() {
  await tags.fetchAll()
}

async function create() {
  const n = name.value.trim()
  if (!n) return
  await tags.create({ name: n, color: color.value || undefined })
  name.value = ''
}

function rename(row: any) {
  renameId.value = row.id
  renameText.value = row.name
  renameVisible.value = true
}

async function confirmRename() {
  if (!renameId.value) return
  await tags.patch(renameId.value, { name: renameText.value.trim() })
  renameVisible.value = false
}

async function remove(row: any) {
  await ElMessageBox.confirm(`Delete tag "${row.name}"?`, 'Confirm', { type: 'warning' })
  await tags.remove(row.id)
}
</script>

<style scoped>
.tags-view {
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
.tag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.tag-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tag-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.tag-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.tag-name {
  font-weight: 600;
}
.tag-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.tag-actions {
  display: flex;
  gap: 8px;
}
</style>
