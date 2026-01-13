<template>
  <div class="tasks-view">
    <el-row :gutter="16">
      <el-col :xs="24" :md="14">
        <el-card shadow="never">
          <SmartTaskInput :parse-natural-language="parseNaturalLanguage" @add-task="createTaskFromDraft" />
        </el-card>

        <el-card shadow="never" class="list-card">
          <div class="list-toolbar">
            <el-button size="small" @click="refresh">Refresh</el-button>
          </div>
          <el-table :data="tasks.items" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="Title" />
            <el-table-column prop="due_at" label="Due" width="180" />
            <el-table-column label="Actions" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="openEdit(row)">Edit</el-button>
                <el-button size="small" type="danger" @click="remove(row)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="10">
        <el-card shadow="never">
          <TaskCalendarView :tasks="tasks.items" />
        </el-card>
      </el-col>
    </el-row>

    <TaskEditorDrawer v-model="drawerOpen" :task="editing" :tags="tags.items" @save="saveEdit" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import SmartTaskInput from '@/components/SmartTaskInput.vue'
import TaskCalendarView from '@/components/TaskCalendarView.vue'
import TaskEditorDrawer from '@/components/TaskEditorDrawer.vue'
import { NlpAPI } from '@/api/endpoints'
import { useTasksStore } from '@/stores/tasks'
import { useListsStore } from '@/stores/lists'
import { useTagsStore } from '@/stores/tags'

const tasks = useTasksStore()
const lists = useListsStore()
const tags = useTagsStore()

const drawerOpen = ref(false)
const editing = ref<any>(null)

onMounted(async () => {
  await Promise.all([lists.fetchAll(), tags.fetchAll()])
  await tasks.fetchList(1, 50)
})

async function refresh() {
  await tasks.fetchList(1, 50)
}

async function parseNaturalLanguage(text: string) {
  const out = await NlpAPI.parse({ text, timezone: 'UTC' })
  return out.draft
}

async function createTaskFromDraft(draft: any) {
  const tagIds: number[] = []
  if (Array.isArray(draft.tagNames) && draft.tagNames.length) {
    for (const name of draft.tagNames) {
      const existing = tags.items.find((t) => t.name === name)
      if (existing) tagIds.push(existing.id)
      else {
        const created = await tags.create({ name })
        tagIds.push(created.id)
      }
    }
  }

  const payload = {
    title: draft.title,
    listId: lists.items[0]?.id ?? 1,
    dueAt: draft.dueAt,
    startAt: draft.startAt,
    priority: draft.priority ?? 0,
    repeatRule: draft.repeatRule,
    tagIds
  }

  try {
    await tasks.createTask(payload)
  } catch {
    tasks.createTaskOffline(payload)
  }
}

function openEdit(task: any) {
  editing.value = task
  drawerOpen.value = true
}

async function saveEdit(patch: any) {
  if (!editing.value) return
  await tasks.patchTask(editing.value.id, patch)
  editing.value = null
}

async function remove(task: any) {
  await ElMessageBox.confirm(`Delete task "${task.title}"?`, 'Confirm', { type: 'warning' })
  await tasks.removeTask(task.id)
}
</script>

<style scoped>
.tasks-view {
  display: grid;
  gap: 16px;
}
.list-card {
  margin-top: 16px;
}
.list-toolbar {
  margin-bottom: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>
