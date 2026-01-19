import { createRouter, createWebHistory } from 'vue-router'
import TasksMainView from '@/views/TasksMainView.vue'
import ListsView from '@/views/ListsView.vue'
import TagsView from '@/views/TagsView.vue'
import HabitsView from '@/views/HabitsView.vue'
import PomodoroView from '@/views/PomodoroView.vue'
import StatsView from '@/views/StatsView.vue'
import SmartListsView from '@/views/SmartListsView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/', name: 'tasks', component: TasksMainView },
    { path: '/lists', name: 'lists', component: ListsView },
    { path: '/tags', name: 'tags', component: TagsView },
    { path: '/habits', name: 'habits', component: HabitsView },
    { path: '/pomodoro', name: 'pomodoro', component: PomodoroView },
    { path: '/stats', name: 'stats', component: StatsView },
    { path: '/smart-lists', name: 'smart-lists', component: SmartListsView }
  ]
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.public) {
    if (to.path === '/login' && auth.accessToken) return { path: '/' }
    return true
  }
  if (!auth.accessToken) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
