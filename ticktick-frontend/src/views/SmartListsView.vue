<template>
  <div class="smart-lists-view">
    <el-row :gutter="20">
      <el-col :xs="24" :lg="10">
        <el-card class="tt-card">
          <div class="tt-section-title">Create smart list</div>
          <el-form label-position="top" class="builder-form">
            <el-form-item label="Name">
              <el-input v-model="name" placeholder="Focus list name" />
            </el-form-item>
            <el-form-item label="Rule">
              <SmartListBuilder v-model="rule" />
            </el-form-item>
            <el-button type="primary" @click="create">Create</el-button>
          </el-form>
        </el-card>

        <el-card class="tt-card list-card">
          <div class="tt-section-title">Saved smart lists</div>
          <div v-if="smartLists.items.length" class="list-items">
            <div v-for="item in smartLists.items" :key="item.id" class="list-item">
              <div>
                <div class="list-name">{{ item.name }}</div>
                <div class="list-meta">Rule-driven list</div>
              </div>
              <div class="list-actions">
                <el-button size="small" text @click="run(item)">Run</el-button>
                <el-button size="small" text type="danger" @click="remove(item)">Delete</el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="No smart lists yet" />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="14">
        <el-card class="tt-card">
          <div class="tt-section-title">Run result</div>
          <el-empty v-if="!smartLists.lastRun" description="No result yet" />
          <div v-else class="run-table">
            <div v-for="task in smartLists.lastRun.items || []" :key="task.id" class="run-row">
              <div>
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">Due {{ task.due_at || 'No date' }}</div>
              </div>
              <el-tag v-if="task.due_at" size="small">Due</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import SmartListBuilder from '@/components/SmartListBuilder.vue'
import { useSmartListsStore } from '@/stores/smartLists'

const smartLists = useSmartListsStore()
const name = ref('')
const rule = ref<any>({
  status: 'all',
  due: 'any',
  priorityGte: 0,
  keyword: ''
})

onMounted(async () => {
  await smartLists.fetchAll()
})

async function create() {
  const n = name.value.trim()
  if (!n) return
  await smartLists.create({ name: n, queryJson: rule.value })
  name.value = ''
}

async function run(row: any) {
  await smartLists.run(row.id, { cursor: null, pageSize: 50 })
}

async function remove(row: any) {
  await ElMessageBox.confirm(`Delete smart list "${row.name}"?`, 'Confirm', { type: 'warning' })
  await smartLists.remove(row.id)
}
</script>

<style scoped>
.smart-lists-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.builder-form {
  margin-top: 12px;
}
.list-card {
  margin-top: 18px;
}
.list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
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
.run-table {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}
.run-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
}
.task-title {
  font-weight: 600;
}
.task-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
