<template>
  <RouterView v-if="isAuthRoute" />
  <el-container v-else class="app-shell">
    <el-aside width="260px" class="sidebar">
      <div class="brand">
        <span class="brand-dot" />
        <span class="brand-text">TickTick</span>
      </div>
      <el-button type="primary" class="quick-add" @click="goToInbox">New Task</el-button>

      <div class="nav-group">
        <div class="nav-title">Smart Lists</div>
        <el-menu :default-active="activeMenu" class="nav-menu" @select="onSelect">
          <el-menu-item index="tasks-inbox">
            <span>Inbox</span>
            <el-badge v-if="inboxCount" :value="inboxCount" class="count" />
          </el-menu-item>
          <el-menu-item index="tasks-today">
            <span>Today</span>
            <el-badge v-if="todayCount" :value="todayCount" class="count" />
          </el-menu-item>
          <el-menu-item index="tasks-upcoming">
            <span>Upcoming</span>
            <el-badge v-if="upcomingCount" :value="upcomingCount" class="count" />
          </el-menu-item>
          <el-menu-item index="tasks-completed">
            <span>Completed</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="nav-group">
        <div class="nav-title">Collections</div>
        <el-menu :default-active="activeMenu" class="nav-menu" @select="onSelect">
          <el-menu-item index="/lists">Lists</el-menu-item>
          <el-menu-item index="/tags">Tags</el-menu-item>
          <el-menu-item index="/habits">Habits</el-menu-item>
          <el-menu-item index="/pomodoro">Pomodoro</el-menu-item>
          <el-menu-item index="/stats">Stats</el-menu-item>
          <el-menu-item index="/smart-lists">Smart Lists</el-menu-item>
        </el-menu>
      </div>

      <div class="profile-card">
        <div class="profile-avatar">TT</div>
        <div>
          <div class="profile-name">Focus Mode</div>
          <div class="profile-meta">Synced workspace</div>
        </div>
      </div>
    </el-aside>

    <el-container class="content-shell">
      <el-header class="topbar">
        <div class="topbar-title">
          <div class="tt-section-title">{{ pageTitle }}</div>
          <div class="topbar-subtitle">{{ pageSubtitle }}</div>
        </div>
        <div class="topbar-actions">
          <el-input v-model="searchText" placeholder="Search tasks" :prefix-icon="Search" />
          <el-button>Filter</el-button>
          <el-dropdown trigger="click">
            <span class="user-pill">
              <span class="user-initials">{{ userInitials }}</span>
              <span class="user-name">{{ auth.user?.name || auth.user?.email }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useWsRouter } from '@/stores/wsRouter'
import { useSyncStore } from '@/stores/sync'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'

onMounted(() => {
  const router = useWsRouter()
  router.installDefaults()

  const sync = useSyncStore()
  sync.restoreFromStorage()

  const auth = useAuthStore()
  if (auth.accessToken) sync.initWs()
})

const route = useRoute()
const router = useRouter()
const searchText = ref('')
const tasks = useTasksStore()
const auth = useAuthStore()

const isAuthRoute = computed(() => route.path === '/login')

const viewKey = computed(() => {
  const view = String(route.query.view || 'inbox')
  return ['inbox', 'today', 'upcoming', 'completed'].includes(view) ? view : 'inbox'
})

const activeMenu = computed(() => {
  if (route.path === '/') return `tasks-${viewKey.value}`
  return route.path
})

const menuRoutes: Record<string, any> = {
  'tasks-inbox': { path: '/', query: { view: 'inbox' } },
  'tasks-today': { path: '/', query: { view: 'today' } },
  'tasks-upcoming': { path: '/', query: { view: 'upcoming' } },
  'tasks-completed': { path: '/', query: { view: 'completed' } }
}

function onSelect(index: string) {
  const target = menuRoutes[index] || index
  router.push(target)
}

function goToInbox() {
  router.push({ path: '/', query: { view: 'inbox' } })
}

const pageTitle = computed(() => {
  if (route.path === '/') {
    const titleMap: Record<string, string> = {
      inbox: 'Inbox',
      today: 'Today',
      upcoming: 'Upcoming',
      completed: 'Completed'
    }
    return titleMap[viewKey.value] || 'Inbox'
  }
  const map: Record<string, string> = {
    '/lists': 'Lists',
    '/tags': 'Tags',
    '/habits': 'Habits',
    '/pomodoro': 'Pomodoro',
    '/stats': 'Stats',
    '/smart-lists': 'Smart Lists'
  }
  return map[route.path] || 'TickTick'
})

const pageSubtitle = computed(() => {
  if (route.path === '/') {
    return 'Plan your day and keep momentum'
  }
  const map: Record<string, string> = {
    '/lists': 'Organize by projects and areas',
    '/tags': 'Capture context at a glance',
    '/habits': 'Track small wins every day',
    '/pomodoro': 'Focus cycles and breaks',
    '/stats': 'Your productivity overview',
    '/smart-lists': 'Automate with smart filters'
  }
  return map[route.path] || 'Stay focused'
})

const todayKey = new Date().toISOString().slice(0, 10)
const inboxCount = computed(() => tasks.items.filter((t) => !t.is_completed).length)
const todayCount = computed(() =>
  tasks.items.filter((t) => !t.is_completed && (t.due_at || '').startsWith(todayKey)).length
)
const upcomingCount = computed(() =>
  tasks.items.filter((t) => {
    if (t.is_completed) return false
    if (!t.due_at) return false
    return t.due_at.slice(0, 10) > todayKey
  }).length
)

const userInitials = computed(() => {
  const name = auth.user?.name || auth.user?.email || 'U'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
})

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}
.sidebar {
  border-right: 1px solid var(--el-border-color);
  padding: 20px 16px;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 20px;
}
.brand-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--tt-red), var(--tt-orange));
  display: inline-block;
}
.quick-add {
  width: 100%;
  border-radius: 999px;
  font-weight: 600;
}
.nav-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.nav-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--el-text-color-secondary);
  margin-left: 6px;
}
.nav-menu {
  border-right: none;
  background: transparent;
}
.nav-menu :deep(.el-menu-item) {
  border-radius: 12px;
  height: 40px;
  line-height: 40px;
}
.nav-menu :deep(.el-menu-item.is-active) {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}
.count {
  margin-left: auto;
}
.profile-card {
  margin-top: auto;
  border-radius: 14px;
  padding: 12px;
  background: var(--tt-slate-50);
  border: 1px solid var(--el-border-color);
  display: flex;
  gap: 12px;
  align-items: center;
}
.profile-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: var(--el-color-primary);
}
.profile-name {
  font-weight: 600;
}
.profile-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.content-shell {
  min-height: 100vh;
}
.topbar {
  padding: 18px 24px 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: var(--tt-slate-100);
  border-bottom: 1px solid var(--el-border-color);
}
.topbar-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.topbar-subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.topbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.user-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--el-border-color);
  background: #fff;
  font-weight: 600;
  cursor: pointer;
}
.user-initials {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  display: grid;
  place-items: center;
  font-size: 12px;
}
.user-name {
  font-size: 13px;
  color: var(--el-text-color-primary);
}
.topbar-actions :deep(.el-input__wrapper) {
  border-radius: 999px;
  box-shadow: none;
  background: #fff;
}
.main {
  padding: 24px;
}
</style>
