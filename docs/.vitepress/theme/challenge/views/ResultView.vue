<script setup lang="ts">
import { computed } from 'vue'
import type { ChallengeStore } from '../useChallenge'

const props = defineProps<{ store: ChallengeStore }>()
const emit = defineEmits<{
  map: []
  learn: [sid: number]
  quiz: [sid: number]
  review: []
  badges: []
  home: []
}>()

const { chapter, session, state, questionOf } = props.store

const result = computed(() => session.value?.result ?? null)
const isReview = computed(() => session.value?.mode === 'review')
const stage = computed(() =>
  result.value && result.value.sid > 0 ? chapter.stages[result.value.sid - 1] : null
)
const wrongPreview = computed(() => {
  const r = result.value
  if (!r) return []
  return r.wrongItems.slice(0, 2).map((w) => questionOf({ sid: w.sid, qid: w.qid }).q)
})

/** 复习模式答对但错题本仍有残留时的文案 */
const reviewHint = computed(() => {
  const r = result.value
  if (!r) return ''
  if (r.wrongCount === 0) {
    return state.wrong.length === 0
      ? '错题本已清空，继续保持！'
      : `本次全部答对，错题本还剩 ${state.wrong.length} 题（来自其他关卡）。`
  }
  return `本次仍有 ${r.wrongCount} 题答错，已保留在错题本中。`
})
</script>

<template>
  <section v-if="result" class="cg-result">
    <div class="cg-rb-title">
      <template v-if="isReview">错题重做 · 结算</template>
      <template v-else>第 {{ stage?.num }} 关 · {{ stage?.title }} · 结算</template>
    </div>
    <div class="cg-rb-sub">共 {{ result.total }} 题 · 答对 {{ result.correct }} 题</div>

    <div class="cg-stars-anim">
      <span v-for="i in 3" :key="i" :class="i <= result.stars ? 'cg-star-on' : 'cg-star-off'">★</span>
    </div>

    <div class="cg-score-big">
      {{ result.pct }}<small>% 得分率</small>
    </div>

    <div v-if="isReview" class="cg-rb-pass" :class="result.wrongCount === 0 ? 'pass' : 'fail'">
      {{ result.wrongCount === 0 ? '✓ 本次全部答对' : '仍有错题，建议再练一次' }}
    </div>
    <div v-else class="cg-rb-pass" :class="result.passed ? 'pass' : 'fail'">
      {{ result.passed ? '✓ 通过本关' : '未通过 · 得分率需 ≥50%' }}
    </div>

    <div v-if="isReview" class="cg-wrong-preview">
      <b>{{ reviewHint }}</b>
    </div>
    <div v-else-if="result.wrongCount > 0" class="cg-wrong-preview">
      <b>本次答错 {{ result.wrongCount }} 题（已收入错题本）：</b>
      <div v-for="(q, i) in wrongPreview" :key="i" class="cg-wq">· {{ q }}</div>
      <div v-if="result.wrongCount > 2">……共 {{ result.wrongCount }} 题</div>
    </div>
    <div v-else class="cg-wrong-preview" style="background: var(--cg-green-soft); border-color: var(--cg-green)">
      <b>全对！</b>没有错题，无需复习。
    </div>

    <div class="cg-result-actions">
      <template v-if="isReview">
        <button class="cg-btn cg-btn-primary" @click="emit('review')">
          返回错题本（{{ state.wrong.length }}）
        </button>
        <button class="cg-btn cg-btn-ghost" @click="emit('map')">返回关卡地图</button>
        <button class="cg-btn cg-btn-ghost" @click="emit('home')">返回首页</button>
      </template>
      <template v-else>
        <button
          v-if="result.passed && result.sid < chapter.stages.length"
          class="cg-btn cg-btn-green"
          @click="emit('learn', result.sid + 1)"
        >
          继续下一关 →
        </button>
        <button
          v-else-if="result.passed"
          class="cg-btn cg-btn-green"
          @click="emit('badges')"
        >
          查看徽章墙
        </button>
        <button v-if="result.wrongCount > 0" class="cg-btn cg-btn-ghost" @click="emit('review')">
          复习错题
        </button>
        <button class="cg-btn cg-btn-ghost" @click="emit('map')">返回地图</button>
        <button v-if="!result.passed" class="cg-btn cg-btn-primary" @click="emit('quiz', result.sid)">
          再试一次
        </button>
      </template>
    </div>
  </section>

  <section v-else class="cg-empty">
    暂无结算数据。
    <div style="margin-top: 14px">
      <button class="cg-btn cg-btn-primary cg-btn-sm" @click="emit('map')">返回关卡地图</button>
    </div>
  </section>
</template>
