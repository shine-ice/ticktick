<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-date-picker v-model="start" type="datetime" placeholder="Start" />
      <el-date-picker v-model="end" type="datetime" placeholder="End" />
      <el-button type="primary" @click="load">Load</el-button>
    </div>

    <el-empty v-if="!stats.overview" description="No data" />
    <pre v-else class="json">{{ formatted }}</pre>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStatsStore } from '@/stores/stats'

const stats = useStatsStore()
const start = ref(new Date())
const end = ref(new Date())
const formatted = computed(() => JSON.stringify(stats.overview, null, 2))

async function load() {
  await stats.fetchOverview(start.value.toISOString(), end.value.toISOString())
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
.json {
  background: var(--el-bg-color-page);
  padding: 12px;
  border-radius: 8px;
}
</style>
