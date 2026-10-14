<script setup lang="ts">
import { computed } from 'vue'
import type { ChallengeStore } from '../useChallenge'

const props = defineProps<{ store: ChallengeStore }>()
const emit = defineEmits<{ done: []; abort: ['map' | 'review'] }>()

const { chapter, session, questionOf, pick, next } = props.store

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F']

const ref_ = computed(() => (session.value ? session.value.queue[session.value.idx] : null))
const question = computed(() => (ref_.value ? questionOf(ref_.value) : null))
const stage = computed(() => (ref_.value ? chapter.stages[ref_.value.sid - 1] : null))
const total = computed(() => session.value?.queue.length ?? 0)
const pct = computed(() =>
  total.value ? Math.round(((session.value?.idx ?? 0) / total.value) * 100) : 0
)

function onPick(i: number) {
  pick(i)
}

function onNext() {
  const s = session.value
  if (!s) return
  if (s.idx >= s.queue.length - 1) {
    next()
    emit('done')
  } else {
    next()
  }
}

function optClass(i: number) {
  const s = session.value
  if (!s || !s.answered || !question.value) return ''
  if (i === question.value.a) return 'is-correct'
  if (i === s.picked) return 'is-wrong'
  return ''
}
</script>

<template>
  <section v-if="session && question" class="cg-quiz-box">
    <div class="cg-quiz-progress">
      <div class="cg-qp-top">
        <span>第 <b>{{ session.idx + 1 }}</b> / {{ total }} 题</span>
        <span>当前得分：<span class="cg-score">{{ session.score }}</span> XP</span>
      </div>
      <div class="cg-progress-track cg-track-light">
        <div class="cg-progress-fill cg-fill-blue" :style="{ width: pct + '%' }" />
      </div>
    </div>

    <div class="cg-qcard">
      <span class="cg-qtag">
        <template v-if="session.mode === 'review'">错题重做 · {{ question.tag }}</template>
        <template v-else>
          讲义 {{ stage?.sec }} · 第 {{ stage?.num }} 关 · {{ question.tag }}
        </template>
      </span>
      <div class="cg-qtext">{{ question.q }}</div>

      <div class="cg-opts">
        <button
          v-for="(opt, i) in question.opts"
          :key="i"
          class="cg-opt"
          :class="optClass(i)"
          :disabled="session.answered"
          @click="onPick(i)"
        >
          <span class="cg-opt-key">{{ KEYS[i] }}</span>
          <span>{{ opt }}</span>
        </button>
      </div>

      <div
        v-if="session.answered"
        class="cg-explain"
        :class="session.picked === question.a ? 'is-right' : 'is-wrong'"
      >
        <b>{{ session.picked === question.a ? '回答正确！' : `回答错误，正确答案是 ${KEYS[question.a]}` }}</b>
        解析：{{ question.ex }}
      </div>

      <div class="cg-quiz-foot">
        <button
          v-if="session.answered"
          class="cg-btn cg-btn-primary"
          @click="onNext"
        >
          {{ session.idx >= total - 1 ? '查看结果' : '下一题' }}
        </button>
      </div>
    </div>

    <div style="margin-top: 16px">
      <button
        class="cg-btn cg-btn-ghost cg-btn-sm"
        @click="emit('abort', session.mode === 'review' ? 'review' : 'map')"
      >
        退出（本次进度不保存）
      </button>
    </div>
  </section>

  <section v-else class="cg-empty">
    当前没有进行中的测验。<br />
    <button class="cg-btn cg-btn-primary cg-btn-sm" style="margin-top: 14px" @click="emit('abort', 'map')">
      返回关卡地图
    </button>
  </section>
</template>
