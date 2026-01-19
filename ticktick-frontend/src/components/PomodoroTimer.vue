<template>
  <el-card class="pomodoro">
    <div class="ring" :class="mode">
      <div class="time">{{ formatted }}</div>
      <div class="mode">{{ mode === 'focus' ? 'Focus' : 'Break' }}</div>
    </div>
    <div class="controls">
      <el-button type="primary" @click="toggle">{{ running ? 'Pause' : 'Start' }}</el-button>
      <el-button @click="reset">Reset</el-button>
    </div>
    <div class="meta">
      <span>{{ running ? 'In progress' : 'Ready when you are' }}</span>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  focusSeconds?: number
  breakSeconds?: number
}>()

const emit = defineEmits<{
  (e: 'finished', payload: { mode: 'focus' | 'break'; elapsed: number }): void
}>()

const focus = computed(() => props.focusSeconds ?? 1500)
const rest = computed(() => props.breakSeconds ?? 300)

const mode = ref<'focus' | 'break'>('focus')
const remaining = ref(focus.value)
const running = ref(false)
let timer: number | null = null

const formatted = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

function tick() {
  if (remaining.value <= 0) {
    const finishedMode = mode.value
    emit('finished', { mode: finishedMode, elapsed: finishedMode === 'focus' ? focus.value : rest.value })
    mode.value = finishedMode === 'focus' ? 'break' : 'focus'
    remaining.value = mode.value === 'focus' ? focus.value : rest.value
    return
  }
  remaining.value -= 1
}

function start() {
  if (timer) return
  running.value = true
  timer = window.setInterval(tick, 1000)
}

function stop() {
  running.value = false
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
}

function toggle() {
  if (running.value) stop()
  else start()
}

function reset() {
  stop()
  remaining.value = mode.value === 'focus' ? focus.value : rest.value
}

watch(
  () => [props.focusSeconds, props.breakSeconds],
  () => {
    if (!running.value) {
      remaining.value = mode.value === 'focus' ? focus.value : rest.value
    }
  }
)

onBeforeUnmount(() => stop())
</script>

<style scoped>
.pomodoro {
  display: grid;
  gap: 12px;
  justify-items: center;
}
.ring {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 10px solid var(--el-color-primary-light-8);
  display: grid;
  place-items: center;
  background: #fff;
  text-align: center;
  gap: 6px;
  padding: 12px;
}
.ring.break {
  border-color: #dbeafe;
}
.time {
  font-size: 42px;
  font-weight: 800;
}
.mode {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.controls {
  display: flex;
  gap: 8px;
}
.meta {
  color: var(--el-text-color-secondary);
}
</style>
