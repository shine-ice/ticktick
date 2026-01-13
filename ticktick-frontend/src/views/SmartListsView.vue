<template>
  <el-row :gutter="16">
    <el-col :xs="24" :md="10">
      <el-card shadow="never">
        <el-form label-position="top">
          <el-form-item label="Name">
            <el-input v-model="name" />
          </el-form-item>
          <el-form-item label="Rule">
            <SmartListBuilder v-model="rule" />
          </el-form-item>
          <el-button type="primary" @click="create">Create</el-button>
        </el-form>
      </el-card>

      <el-card shadow="never" class="list-card">
        <el-table :data="smartLists.items" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="Name" />
          <el-table-column label="Actions" width="220">
            <template #default="{ row }">
              <el-button size="small" @click="run(row)">Run</el-button>
              <el-button size="small" type="danger" @click="remove(row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>

    <el-col :xs="24" :md="14">
      <el-card shadow="never">
        <div class="title">Run result</div>
        <el-empty v-if="!smartLists.lastRun" description="No result" />
        <el-table v-else :data="smartLists.lastRun.items || []">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="Title" />
          <el-table-column prop="due_at" label="Due" width="180" />
        </el-table>
      </el-card>
    </el-col>
  </el-row>
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
.list-card {
  margin-top: 16px;
}
.title {
  font-weight: 600;
  margin-bottom: 8px;
}
</style>
