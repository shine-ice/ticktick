<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-input v-model="name" placeholder="Tag name" style="width: 240px" />
      <el-color-picker v-model="color" />
      <el-button type="primary" @click="create">Create</el-button>
      <el-button @click="refresh">Refresh</el-button>
    </div>

    <el-table :data="tags.items" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Name" />
      <el-table-column label="Color" width="140">
        <template #default="{ row }">
          <el-tag v-if="row.color" :style="{ background: row.color, borderColor: row.color, color: '#fff' }">
            {{ row.color }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="220">
        <template #default="{ row }">
          <el-button size="small" @click="rename(row)">Rename</el-button>
          <el-button size="small" type="danger" @click="remove(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="renameVisible" title="Rename tag" width="420px">
      <el-input v-model="renameText" />
      <template #footer>
        <el-button @click="renameVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmRename">Save</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useTagsStore } from '@/stores/tags'

const tags = useTagsStore()
const name = ref('')
const color = ref<string | null>('#67C23A')

const renameVisible = ref(false)
const renameId = ref<number | null>(null)
const renameText = ref('')

onMounted(async () => {
  await tags.fetchAll()
})

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
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}
</style>
