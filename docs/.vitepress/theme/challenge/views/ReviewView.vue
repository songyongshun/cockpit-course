<script setup lang="ts">
import type { ChallengeStore } from '../useChallenge'

const props = defineProps<{ store: ChallengeStore }>()
const emit = defineEmits<{ start: []; map: []; home: []; badges: [] }>()

const { chapter, state, questionOf } = props.store

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F']

function stageTitle(sid: number) {
  const st = chapter.stages[sid - 1]
  return st ? `第 ${st.num} 关 · ${st.title}` : `第 ${sid} 关`
}

function questionText(sid: number, qid: number) {
  const q = questionOf({ sid, qid })
  return q ? q.q : '（题目不存在）'
}

function answerText(sid: number, qid: number) {
  const q = questionOf({ sid, qid })
  if (!q) return ''
  return `${KEYS[q.a]} ${q.opts[q.a]}`
}
</script>

<template>
  <section class="cg-section" style="margin-top: 0">
    <h3 class="cg-section-title">错题本：{{ state.wrong.length }} 题</h3>

    <div v-if="state.wrong.length === 0" class="cg-empty">
      错题本是空的。答错的题会自动收在这里，全部答对即可清空。
      <div style="margin-top: 14px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap">
        <button class="cg-btn cg-btn-primary cg-btn-sm" @click="emit('map')">返回关卡地图</button>
        <button class="cg-btn cg-btn-ghost cg-btn-sm" @click="emit('home')">返回首页</button>
      </div>
    </div>

    <template v-else>
      <div class="cg-foot-actions" style="margin-bottom: 16px">
        <button class="cg-btn cg-btn-primary" @click="emit('start')">
          开始重做（{{ state.wrong.length }} 题）→
        </button>
        <div class="cg-right">
          <button class="cg-btn cg-btn-ghost cg-btn-sm" @click="emit('map')">返回地图</button>
          <button class="cg-btn cg-btn-ghost cg-btn-sm" @click="emit('badges')">徽章墙</button>
        </div>
      </div>

      <div class="cg-list">
        <div v-for="(w, i) in state.wrong" :key="`${w.sid}-${w.qid}`" class="cg-list-item">
          <div class="cg-li-head">
            <span>第 {{ i + 1 }} 题 · {{ stageTitle(w.sid) }}</span>
            <span>上次选择：{{ KEYS[w.picked] }}</span>
          </div>
          <div class="cg-li-q">{{ questionText(w.sid, w.qid) }}</div>
          <div class="cg-li-a">正确答案：{{ answerText(w.sid, w.qid) }}</div>
        </div>
      </div>
    </template>
  </section>
</template>
