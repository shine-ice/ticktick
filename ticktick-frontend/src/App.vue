<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="aside">
      <div class="brand">TickTick</div>
      <el-menu :default-active="$route.path" router>
        <el-menu-item index="/">Tasks</el-menu-item>
        <el-menu-item index="/lists">Lists</el-menu-item>
        <el-menu-item index="/tags">Tags</el-menu-item>
        <el-menu-item index="/habits">Habits</el-menu-item>
        <el-menu-item index="/pomodoro">Pomodoro</el-menu-item>
        <el-menu-item index="/stats">Stats</el-menu-item>
        <el-menu-item index="/smart-lists">Smart Lists</el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main">
      <RouterView />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useWsRouter } from '@/stores/wsRouter'
import { useSyncStore } from '@/stores/sync'
import { useAuthStore } from '@/stores/auth'

onMounted(() => {
  const router = useWsRouter()
  router.installDefaults()

  const sync = useSyncStore()
  sync.restoreFromStorage()

  const auth = useAuthStore()
  if (auth.accessToken) sync.initWs()
})
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}
.aside {
  border-right: 1px solid var(--el-border-color);
  padding: 12px;
}
.brand {
  font-weight: 700;
  font-size: 18px;
  margin: 8px 8px 16px;
}
.main {
  padding: 16px;
}
</style>
