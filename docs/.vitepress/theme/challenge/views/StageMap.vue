<script setup lang="ts">
import type { ChallengeStore } from '../useChallenge'
import { BADGES } from '../useChallenge'

const props = defineProps<{ store: ChallengeStore }>()
const emit = defineEmits<{
  learn: [sid: number]
  quiz: [sid: number]
  home: []
  review: []
  badges: []
}>()

const { chapter, state, stageState, passedCount, currentStage, totalStars, maxStars } = props.store
const totalBadges = BADGES.length
const totalQuestions = chapter.stages.reduce((sum, st) => sum + st.quiz.length, 0)

/** 未答对时展示三星占位（用圆圈数字表示已获得星数） */
function starText(n: number) {
  return '★'.repeat(n) + '☆'.repeat(3 - n)
}
</script>

<template>
  <section class="cg-section" style="margin-top: 0">
    <h3 class="cg-section-title">
      关卡地图：共 {{ chapter.stages.length }} 关 / {{ totalQuestions }} 题，已通过 {{ passedCount }} 关（星级 {{ totalStars }}/{{ maxStars }}）
    </h3>
    <div class="cg-map">
      <div
        v-for="st in chapter.stages"
        :key="st.id"
        class="cg-node"
        :class="stageState(st.id)"
      >
        <div class="cg-node-dot">
          <template v-if="stageState(st.id) === 'done'">✓</template>
          <template v-else-if="stageState(st.id) === 'locked'">🔒</template>
          <template v-else>{{ st.num }}</template>
        </div>
        <div class="cg-node-body">
          <span class="cg-node-sec">讲义 {{ st.sec }} · {{ st.secName }}</span>
          <h4 class="cg-node-title">
            第 {{ st.num }} 关 · {{ st.title }}
            <span v-if="st.id === currentStage && stageState(st.id) === 'ready'" class="cg-tag">当前关卡</span>
          </h4>
          <p class="cg-node-desc">{{ st.desc }}</p>
          <p class="cg-node-desc">过关要求：{{ st.passNote }}</p>
          <div class="cg-node-foot">
            <span class="cg-stars" :title="`最佳得分率 ${state.best[st.id - 1]}%`">
              {{ starText(state.stars[st.id - 1]) }}
            </span>
            <template v-if="stageState(st.id) === 'locked'">
              <span class="cg-tag cg-tag-lock">通过上一关后解锁</span>
            </template>
            <template v-else>
              <span style="display: flex; gap: 10px; flex-wrap: wrap">
                <button class="cg-btn cg-btn-primary cg-btn-sm" @click="emit('quiz', st.id)">
                  {{ state.attempts[st.id - 1] > 0 ? '重新闯关' : '开始闯关' }}（{{ st.quiz.length }} 题）
                </button>
                <button class="cg-btn cg-btn-ghost cg-btn-sm" @click="emit('learn', st.id)">
                  {{ state.learned[st.id - 1] ? '复习知识卡' : '先学知识卡' }}（{{ st.cards.length }} 张）
                </button>
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="cg-foot-actions" style="margin-top: 18px">
      <button class="cg-btn cg-btn-ghost cg-btn-sm" @click="emit('home')">返回首页</button>
      <button class="cg-btn cg-btn-ghost cg-btn-sm" @click="emit('review')">
        错题本（{{ state.wrong.length }}）
      </button>
      <button class="cg-btn cg-btn-ghost cg-btn-sm" @click="emit('badges')">
        徽章墙（{{ state.badges.length }}/{{ totalBadges }}）
      </button>
    </div>
  </section>
</template>
