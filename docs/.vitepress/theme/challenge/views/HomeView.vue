<script setup lang="ts">
import { computed } from 'vue'
import type { ChallengeStore } from '../useChallenge'
import { BADGES, questionCount } from '../useChallenge'

const props = defineProps<{ store: ChallengeStore }>()
const emit = defineEmits<{ go: [view: 'map' | 'review' | 'badges'] }>()

const { chapter, state, passedCount, currentStage, totalStars, maxStars, stageState } = props.store

const totalQuestions = questionCount(chapter)
const totalBadges = BADGES.length
const progressPct = computed(() =>
  Math.round((passedCount.value / chapter.stages.length) * 100)
)

const steps = [
  { title: '① 先学知识卡', desc: '每关 2~4 张知识卡，用要点、对照表和讲义插图把关键概念过一遍，翻完才算学过。' },
  { title: '② 再答题闯关', desc: '每关 5~6 道单选题，答完立即判分并给出解析；得分率 ≥50% 即通过，通过一关解锁下一关。' },
  { title: '③ 查漏补缺', desc: '答错的题自动收入错题本，随时重做；全部答对即可清空错题本，并解锁“错题清零”徽章。' }
]
</script>

<template>
  <section class="cg-hero">
    <span class="cg-kicker">{{ chapter.kicker }}</span>
    <h2>{{ chapter.title }}<br><em>闯关学习营</em></h2>
    <p>{{ chapter.intro }}</p>
    <div class="cg-hero-meta">
      <span>关卡：<b>{{ chapter.stages.length }} 关</b></span>
      <span>题库：<b>{{ totalQuestions }} 题</b></span>
      <span>满星：<b>{{ maxStars }} 星</b></span>
      <span>当前进度：<b>第 {{ currentStage }} 关</b> · 已通过 <b>{{ passedCount }}</b> 关</span>
    </div>
    <div class="cg-hero-actions">
      <button class="cg-btn cg-btn-primary" @click="emit('go', 'map')">开始闯关 →</button>
      <button class="cg-btn cg-btn-ghost" @click="emit('go', 'review')">
        错题本（{{ state.wrong.length }}）
      </button>
      <button class="cg-btn cg-btn-ghost" @click="emit('go', 'badges')">
        徽章墙（{{ state.badges.length }}/{{ totalBadges }}）
      </button>
    </div>
    <div class="cg-progress-block">
      <div class="cg-progress-label">
        <span>总进度</span>
        <span>已通过 {{ passedCount }} / {{ chapter.stages.length }} 关 · 星级 {{ totalStars }} / {{ maxStars }}</span>
      </div>
      <div class="cg-progress-track">
        <div class="cg-progress-fill" :style="{ width: progressPct + '%' }" />
      </div>
    </div>
  </section>

  <section class="cg-section">
    <h3 class="cg-section-title">闯关规则</h3>
    <div class="cg-grid">
      <div v-for="s in steps" :key="s.title" class="cg-tile">
        <h4>{{ s.title }}</h4>
        <p>{{ s.desc }}</p>
      </div>
    </div>
  </section>

  <section class="cg-section">
    <h3 class="cg-section-title">关卡一览</h3>
    <div class="cg-list">
      <div v-for="st in chapter.stages" :key="st.id" class="cg-list-item">
        <div class="cg-li-head">
          <span>第 {{ st.num }} 关 · 讲义 {{ st.sec }}</span>
          <span v-if="stageState(st.id) === 'done'" class="cg-tag cg-tag-pass">已通过</span>
          <span v-else-if="stageState(st.id) === 'ready'" class="cg-tag">可挑战</span>
          <span v-else class="cg-tag cg-tag-lock">未解锁</span>
        </div>
        <div class="cg-li-q">{{ st.title }}</div>
        <div class="cg-li-a">{{ st.desc }}</div>
      </div>
    </div>
  </section>

  <p class="cg-source">
    内容依据 <code>docs/course/chapter-01</code> 下《任务1 认识智能座舱》《任务2 认识车载视觉交互系统》
    两篇讲义编写；插图取自原始课件。
  </p>
</template>
