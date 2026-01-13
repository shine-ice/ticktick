<template>
  <el-row :gutter="16">
    <el-col :xs="24" :md="12">
      <PomodoroTimer :focus-seconds="settings.focus_minutes * 60" :break-seconds="settings.break_minutes * 60" @finished="onFinished" />
    </el-col>
    <el-col :xs="24" :md="12">
      <el-card shadow="never">
        <el-form label-position="top">
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
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
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
</script>
