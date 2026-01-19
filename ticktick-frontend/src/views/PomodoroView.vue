<template>
  <div class="pomodoro-view">
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card class="tt-card timer-card">
          <PomodoroTimer
            :focus-seconds="settings.focus_minutes * 60"
            :break-seconds="settings.break_minutes * 60"
            @finished="onFinished"
          />
        </el-card>

        <el-card class="tt-card stats-card">
          <div class="tt-section-title">This week</div>
          <div class="stat-row">
            <el-statistic title="Focus minutes" :value="focusMinutes" />
            <el-statistic title="Sessions" :value="sessionsCount" />
          </div>
          <div class="tt-subtle">Stay consistent and build long focus streaks.</div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="tt-card">
          <div class="tt-section-title">Timer settings</div>
          <el-form label-position="top" class="settings-form">
            <el-form-item label="Focus minutes">
              <el-input-number v-model="settings.focus_minutes" :min="1" :max="180" />
            </el-form-item>
            <el-form-item label="Break minutes">
              <el-input-number v-model="settings.break_minutes" :min="1" :max="60" />
            </el-form-item>
            <el-form-item label="Long break minutes">
              <el-input-number v-model="settings.long_break_minutes" :min="1" :max="120" />
            </el-form-item>
            <el-form-item label="Cycles before long break">
              <el-input-number v-model="settings.cycles_before_long_break" :min="1" :max="10" />
            </el-form-item>
            <el-button type="primary" @click="saveSettings">Save settings</el-button>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import PomodoroTimer from '@/components/PomodoroTimer.vue'
import { usePomodoroStore } from '@/stores/pomodoro'

const pomodoro = usePomodoroStore()
const settings = reactive<any>({
  focus_minutes: 25,
  break_minutes: 5,
  long_break_minutes: 15,
  cycles_before_long_break: 4
})

onMounted(async () => {
  const s = await pomodoro.fetchSettings()
  if (s) Object.assign(settings, s)

  const end = new Date()
  const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  await pomodoro.fetchStats(start.toISOString(), end.toISOString())
})

async function saveSettings() {
  await pomodoro.updateSettings(settings)
}

async function onFinished(payload: { mode: 'focus' | 'break'; elapsed: number }) {
  if (payload.mode !== 'focus') return
  const now = new Date().toISOString()
  const start = new Date(Date.now() - payload.elapsed * 1000).toISOString()
  await pomodoro.createSession({ focusSeconds: payload.elapsed, startedAt: start, endedAt: now })
}

const focusMinutes = computed(() => Math.round((pomodoro.stats?.focusSeconds || 0) / 60))
const sessionsCount = computed(() => pomodoro.stats?.sessionsCount || 0)
</script>

<style scoped>
.pomodoro-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.timer-card {
  display: grid;
  place-items: center;
}
.stats-card {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.stat-row {
  display: flex;
  gap: 24px;
}
.settings-form {
  margin-top: 12px;
}
</style>
