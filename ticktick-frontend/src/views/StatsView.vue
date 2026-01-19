<template>
  <div class="stats-view">
    <el-card class="tt-card">
      <div class="toolbar">
        <div>
          <div class="tt-section-title">Overview</div>
          <div class="tt-subtle">Track tasks, focus, and habit momentum</div>
        </div>
        <div class="filters">
          <el-date-picker v-model="start" type="datetime" placeholder="Start" />
          <el-date-picker v-model="end" type="datetime" placeholder="End" />
          <el-button type="primary" @click="load">Load</el-button>
        </div>
      </div>
    </el-card>

    <div class="cards" v-if="stats.overview">
      <el-card class="tt-card metric-card">
        <div class="metric-value">{{ stats.overview.tasksCompleted }}</div>
        <div class="metric-label">Tasks completed</div>
      </el-card>
      <el-card class="tt-card metric-card">
        <div class="metric-value">{{ stats.overview.tasksCreated }}</div>
        <div class="metric-label">Tasks created</div>
      </el-card>
      <el-card class="tt-card metric-card">
        <div class="metric-value">{{ stats.overview.focusMinutes }}</div>
        <div class="metric-label">Focus minutes</div>
      </el-card>
      <el-card class="tt-card metric-card">
        <div class="metric-value">{{ stats.overview.habitCompletions }}</div>
        <div class="metric-label">Habit check-ins</div>
      </el-card>
    </div>

    <el-card v-if="stats.overview" class="tt-card insights-card">
      <div class="tt-section-title">Top tags</div>
      <div class="tag-bars">
        <div v-for="tag in stats.overview.topTags || []" :key="tag.name" class="tag-bar">
          <div class="tag-name">#{{ tag.name }}</div>
          <el-progress :percentage="tagPercent(tag.count)" :stroke-width="10" />
        </div>
      </div>
      <div v-if="stats.overview.isMock" class="mock-note">
        Data is mocked because the backend lacks a stats overview endpoint.
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useStatsStore } from '@/stores/stats'

const stats = useStatsStore()
const start = ref(new Date())
const end = ref(new Date())

const maxTag = computed(() => {
  const list = stats.overview?.topTags || []
  return list.reduce((max: number, item: any) => Math.max(max, item.count || 0), 1)
})

function tagPercent(count: number) {
  return Math.round((count / maxTag.value) * 100)
}

async function load() {
  await stats.fetchOverview(start.value.toISOString(), end.value.toISOString())
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.stats-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.filters {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.metric-card {
  display: grid;
  gap: 6px;
  text-align: left;
}
.metric-value {
  font-size: 28px;
  font-weight: 700;
}
.metric-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.insights-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tag-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tag-bar {
  display: grid;
  gap: 6px;
}
.tag-name {
  font-weight: 600;
}
.mock-note {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
