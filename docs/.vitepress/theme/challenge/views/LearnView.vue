<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ChallengeStore } from '../useChallenge'

const props = defineProps<{ store: ChallengeStore; sid: number }>()
const emit = defineEmits<{ map: []; quiz: [sid: number] }>()

const { chapter, learnPos, markLearned } = props.store
const stage = computed(() => chapter.stages[props.sid - 1])
const pos = ref(learnPos[props.sid] ?? 0)

/** 翻到最后一张知识卡即视为“学过”，用于解锁“勤学不辍”徽章 */
watch(
  pos,
  (v) => {
    learnPos[props.sid] = v
    if (v === stage.value.cards.length - 1) markLearned(props.sid)
  },
  { immediate: true }
)

watch(
  () => props.sid,
  (v) => {
    pos.value = learnPos[v] ?? 0
  }
)

/** 切章后重置翻卡位置 */
watch(
  () => chapter.id,
  () => {
    pos.value = learnPos[props.sid] ?? 0
  }
)

const card = computed(() => stage.value.cards[pos.value] ?? stage.value.cards[0])
const isLast = computed(() => pos.value === stage.value.cards.length - 1)

function prev() {
  if (pos.value > 0) pos.value -= 1
}

function next() {
  if (!isLast.value) pos.value += 1
}

function startQuiz() {
  markLearned(props.sid)
  emit('quiz', props.sid)
}
</script>

<template>
  <section>
    <div class="cg-learn-head">
      <div>
        <span class="cg-node-sec">讲义 {{ stage.sec }} · {{ stage.secName }}</span>
        <h3>第 {{ stage.num }} 关 · {{ stage.title }}</h3>
        <p>{{ stage.desc }}</p>
      </div>
      <div class="cg-learn-right">
        <div>知识卡 {{ pos + 1 }} / {{ stage.cards.length }}</div>
        <div>本关题目 {{ stage.quiz.length }} 题</div>
        <div style="margin-top: 6px">
          <a :href="stage.source.link">查看对应讲义 · {{ stage.source.text }}</a>
        </div>
      </div>
    </div>

    <div class="cg-kcard">
      <div class="cg-kcard-top">
        <h4>{{ card.title }}</h4>
        <span class="cg-qtag">{{ card.tag }}</span>
      </div>
      <div class="cg-k-body" v-html="card.html" />
      <div v-for="fig in card.figures || []" :key="fig.src" class="cg-fig">
        <div class="cg-fig-cap">{{ fig.caption }}</div>
        <img :src="fig.src" :alt="fig.caption" loading="lazy" />
      </div>
    </div>

    <div class="cg-pager">
      <button
        v-for="(c, i) in stage.cards"
        :key="c.title"
        :class="{ on: i === pos }"
        :aria-label="`第 ${i + 1} 张知识卡`"
        @click="pos = i"
      />
    </div>

    <div class="cg-foot-actions">
      <button class="cg-btn cg-btn-ghost" @click="emit('map')">返回地图</button>
      <div class="cg-right">
        <button class="cg-btn cg-btn-ghost" :disabled="pos === 0" @click="prev">上一张</button>
        <button class="cg-btn cg-btn-ghost" :disabled="isLast" @click="next">下一张</button>
        <button class="cg-btn cg-btn-primary" @click="startQuiz">
          {{ isLast ? '我已掌握，开始闯关 →' : '直接开始闯关 →' }}
        </button>
      </div>
    </div>
  </section>
</template>
