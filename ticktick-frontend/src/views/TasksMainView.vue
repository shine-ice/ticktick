<template>
  <div class="tasks-view">
    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <el-card class="tt-card">
          <div class="view-switcher">
            <el-tabs v-model="tabKey" @tab-change="onTabChange">
              <el-tab-pane label="Inbox" name="inbox" />
              <el-tab-pane label="Today" name="today" />
              <el-tab-pane label="Upcoming" name="upcoming" />
              <el-tab-pane label="Completed" name="completed" />
            </el-tabs>
            <div class="quick-tools">
              <el-select
                v-model="selectedListId"
                placeholder="Choose list"
                size="small"
                class="list-select"
              >
                <el-option
                  v-for="list in lists.items"
                  :key="list.id"
                  :label="list.name"
                  :value="list.id"
                />
              </el-select>
              <el-button size="small" @click="refresh">Sync</el-button>
            </div>
          </div>

          <SmartTaskInput
            :parse-natural-language="parseNaturalLanguage"
            placeholder="Add a task (e.g. 'Pay rent tomorrow #Home')"
            @add-task="createTaskFromDraft"
          />
        </el-card>

        <el-card class="tt-card list-card">
          <div class="list-header">
            <div>
              <div class="tt-section-title">{{ sectionTitle }}</div>
              <div class="tt-subtle">{{ sectionSubtitle }}</div>
            </div>
            <div class="list-actions">
              <el-select v-model="sortBy" size="small">
                <el-option value="due" label="Sort by due" />
                <el-option value="created" label="Sort by created" />
              </el-select>
            </div>
          </div>

          <div v-if="sortedTasks.length" class="task-list">
            <div v-for="task in sortedTasks" :key="task.id" class="task-item">
              <el-checkbox
                :model-value="task.is_completed === 1"
                class="task-check"
                @change="(val: boolean) => toggleComplete(task, !!val)"
              />
              <div class="task-body">
                <div
                  class="task-title"
                  :class="{ done: task.is_completed === 1 }"
                >
                  {{ task.title }}
                </div>
                <div class="task-meta">
                  <el-tag v-if="listName(task)" size="small" effect="plain">{{
                    listName(task)
                  }}</el-tag>
                  <el-tag
                    v-for="tag in taskTags(task)"
                    :key="tag.id"
                    size="small"
                    effect="light"
                    :style="{
                      borderColor: tag.color || undefined,
                      color: tag.color || undefined,
                    }"
                  >
                    {{ tag.name }}
                  </el-tag>
                  <span
                    v-if="task.due_at"
                    class="due"
                    :class="dueClass(task)"
                    >{{ formatDue(task.due_at) }}</span
                  >
                  <el-tag v-if="task.priority" size="small" type="danger"
                    >P{{ task.priority }}</el-tag
                  >
                </div>
              </div>
              <div class="task-actions">
                <el-button size="small" text @click="openEdit(task)"
                  >Edit</el-button
                >
                <el-button size="small" text type="danger" @click="remove(task)"
                  >Delete</el-button
                >
              </div>
            </div>
          </div>
          <el-empty v-else description="No tasks here yet" />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="tt-card side-card">
          <div class="side-title">Calendar glance</div>
          <TaskCalendarView :tasks="tasks.items" />
        </el-card>

        <el-card class="tt-card side-card">
          <div class="side-title">Quick stats</div>
          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-value">{{ inboxCount }}</div>
              <div class="stat-label">Active tasks</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ todayCount }}</div>
              <div class="stat-label">Due today</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ upcomingCount }}</div>
              <div class="stat-label">Upcoming</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <TaskEditorDrawer
      v-model="drawerOpen"
      :task="editing"
      :tags="tags.items"
      :lists="lists.items"
      @save="saveEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import SmartTaskInput from "@/components/SmartTaskInput.vue";
import TaskCalendarView from "@/components/TaskCalendarView.vue";
import TaskEditorDrawer from "@/components/TaskEditorDrawer.vue";
import { NlpAPI } from "@/api/endpoints";
import { useTasksStore } from "@/stores/tasks";
import { useListsStore } from "@/stores/lists";
import { useTagsStore } from "@/stores/tags";
import type { Task } from "@/stores/types";

const tasks = useTasksStore();
const lists = useListsStore();
const tags = useTagsStore();
const route = useRoute();
const router = useRouter();

const drawerOpen = ref(false);
const editing = ref<Task | null>(null);
const sortBy = ref("due");
const selectedListId = ref<number | null>(null);

const viewKey = computed(() => {
  const view = String(route.query.view || "inbox");
  return ["inbox", "today", "upcoming", "completed"].includes(view)
    ? view
    : "inbox";
});

const tabKey = computed({
  get: () => viewKey.value,
  set: (val: string) => {
    router.push({ path: "/", query: { view: val } });
  },
});

const sectionTitle = computed(() => {
  const map: Record<string, string> = {
    inbox: "Inbox tasks",
    today: "Today focus",
    upcoming: "Upcoming tasks",
    completed: "Completed tasks",
  };
  return map[viewKey.value] || "Inbox tasks";
});

const sectionSubtitle = computed(() => {
  const map: Record<string, string> = {
    inbox: "Everything you have not scheduled yet",
    today: "What matters today",
    upcoming: "Plan ahead for the week",
    completed: "Celebrate the wins",
  };
  return map[viewKey.value] || "Everything you have not scheduled yet";
});

onMounted(async () => {
  await Promise.all([lists.fetchAll(), tags.fetchAll()]);
  if (!selectedListId.value && lists.items[0]) {
    selectedListId.value = lists.items[0].id;
  }
  await tasks.fetchList(1, 100);
});

async function refresh() {
  await tasks.fetchList(1, 100);
}

async function parseNaturalLanguage(text: string) {
  const out = await NlpAPI.parse({ text, timezone: "UTC" });
  return out.draft;
}

async function createTaskFromDraft(draft: any) {
  const tagIds: number[] = [];
  if (Array.isArray(draft.tagNames) && draft.tagNames.length) {
    for (const name of draft.tagNames) {
      const existing = tags.items.find((t) => t.name === name);
      if (existing) tagIds.push(existing.id);
      else {
        const created = await tags.create({ name });
        tagIds.push(created.id);
      }
    }
  }

  const payload = {
    title: draft.title,
    listId: selectedListId.value || lists.items[0]?.id || 1,
    dueAt: draft.dueAt,
    startAt: draft.startAt,
    priority: draft.priority ?? 0,
    repeatRule: draft.repeatRule,
    tagIds,
  };

  try {
    await tasks.createTask(payload);
  } catch {
    tasks.createTaskOffline(payload);
  }
}

function openEdit(task: Task) {
  editing.value = task;
  drawerOpen.value = true;
}

async function saveEdit(patch: any) {
  if (!editing.value) return;
  await tasks.patchTask(editing.value.id, patch);
  editing.value = null;
}

async function remove(task: Task) {
  await ElMessageBox.confirm(`Delete task "${task.title}"?`, "Confirm", {
    type: "warning",
  });
  await tasks.removeTask(task.id);
}

async function toggleComplete(task: Task, value: boolean) {
  const nextValue = value ? 1 : 0;
  const previous = task.is_completed || 0;
  tasks.optimisticPatch(task.id, { is_completed: nextValue });
  try {
    await tasks.patchTask(task.id, { isCompleted: nextValue });
  } catch {
    tasks.optimisticPatch(task.id, { is_completed: previous });
  }
}

const todayKey = new Date().toISOString().slice(0, 10);

const filteredTasks = computed(() => {
  return tasks.items.filter((task) => {
    if (viewKey.value === "completed") return task.is_completed === 1;
    if (task.is_completed === 1) return false;
    if (viewKey.value === "today") {
      return (task.due_at || "").startsWith(todayKey);
    }
    if (viewKey.value === "upcoming") {
      return task.due_at && task.due_at.slice(0, 10) > todayKey;
    }
    return true;
  });
});

const sortedTasks = computed(() => {
  const items = [...filteredTasks.value];
  if (sortBy.value === "created") {
    return items.sort((a, b) => (b.id || 0) - (a.id || 0));
  }
  return items.sort((a, b) => {
    const aDue = a.due_at || "";
    const bDue = b.due_at || "";
    if (!aDue && !bDue) return 0;
    if (!aDue) return 1;
    if (!bDue) return -1;
    return aDue.localeCompare(bDue);
  });
});

const listById = computed(() => {
  const out: Record<number, { name: string; color?: string | null }> = {};
  for (const list of lists.items) {
    out[list.id] = { name: list.name, color: list.color };
  }
  return out;
});

const tagById = computed(() => {
  const out: Record<
    number,
    { id: number; name: string; color?: string | null }
  > = {};
  for (const tag of tags.items) {
    out[tag.id] = { id: tag.id, name: tag.name, color: tag.color };
  }
  return out;
});

function listName(task: Task) {
  return task.list_id ? listById.value[task.list_id]?.name : "";
}

function taskTags(task: Task) {
  const ids = task.tagIds || [];
  return ids.map((id) => tagById.value[id]).filter(Boolean);
}

function formatDue(value: string) {
  const date = new Date(value);
  return date.toLocaleString();
}

function dueClass(task: Task) {
  if (!task.due_at) return "";
  const day = task.due_at.slice(0, 10);
  if (day < todayKey) return "due-overdue";
  if (day === todayKey) return "due-today";
  return "due-upcoming";
}

function onTabChange(name: string) {
  router.push({ path: "/", query: { view: name } });
}

const inboxCount = computed(
  () => tasks.items.filter((t) => !t.is_completed).length,
);
const todayCount = computed(
  () =>
    tasks.items.filter(
      (t) => !t.is_completed && (t.due_at || "").startsWith(todayKey),
    ).length,
);
const upcomingCount = computed(
  () =>
    tasks.items.filter((t) => {
      if (t.is_completed) return false;
      if (!t.due_at) return false;
      return t.due_at.slice(0, 10) > todayKey;
    }).length,
);
</script>

<style scoped>
.tasks-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.view-switcher {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
.view-switcher :deep(.el-tabs__header) {
  margin-bottom: 0;
}
.quick-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}
.list-select {
  width: 180px;
}
.list-card {
  margin-top: 18px;
}
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.list-actions {
  display: flex;
  gap: 8px;
}
.task-list {
  display: grid;
  gap: 12px;
}
.task-item {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  align-items: center;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}
.task-check {
  align-self: start;
}
.task-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.task-title {
  font-weight: 600;
}
.task-title.done {
  text-decoration: line-through;
  color: var(--el-text-color-secondary);
}
.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  align-items: center;
}
.due {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--tt-slate-100);
}
.due-overdue {
  color: #b91c1c;
  background: #fee2e2;
}
.due-today {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
.due-upcoming {
  color: var(--tt-blue);
  background: #e0ebff;
}
.task-actions {
  display: flex;
  gap: 8px;
}
.side-card {
  margin-bottom: 18px;
}
.side-title {
  font-weight: 600;
  margin-bottom: 12px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.stat-box {
  background: var(--tt-slate-50);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
}
.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
