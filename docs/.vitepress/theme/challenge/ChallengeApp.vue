<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Chapter } from './types'
import { useChallenge } from './useChallenge'
import { CHAPTERS, findChapter } from './data'
import HomeView from './views/HomeView.vue'
import StageMap from './views/StageMap.vue'
import LearnView from './views/LearnView.vue'
import QuizView from './views/QuizView.vue'
import ResultView from './views/ResultView.vue'
import ReviewView from './views/ReviewView.vue'
import BadgeWall from './views/BadgeWall.vue'

type ViewName = 'home' | 'map' | 'learn' | 'quiz' | 'result' | 'review' | 'review-result' | 'badges'

const props = withDefaults(defineProps<{ chapter?: string }>(), { chapter: '' })

const initial = (findChapter(props.chapter) ?? CHAPTERS[0]) as Chapter
const chapterId = ref(initial.id)
const chapter = computed(() => (findChapter(chapterId.value) ?? CHAPTERS[0]) as Chapter)
/** 切章后自动创建或复用对应章节的进度状态（store 按章节 id 缓存） */
const store = computed(() => useChallenge(chapter.value))

/** 头部进度条所需的状态别名（模板直接使用 state / passedCount / totalStars / maxStars） */
const state = computed(() => store.value.state)
const passedCount = computed(() => store.value.passedCount)
const totalStars = computed(() => store.value.totalStars)
const maxStars = computed(() => store.value.maxStars)

const view = ref<ViewName>('home')
const sid = ref(1)

/** 章节简称，用于顶部切换标签 */
function shortTitle(c: Chapter) {
  return c.title.split(/\s+/)[0] || c.title
}

function scrollTop() {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function go(next: ViewName, stage?: number) {
  view.value = next
  if (typeof stage === 'number') sid.value = stage
  scrollTop()
}

function switchChapter(id: string) {
  if (id === chapterId.value) return
  chapterId.value = id
  view.value = 'home'
  sid.value = 1
  scrollTop()
}

function toLearn(stage: number) {
  go('learn', stage)
}

function toQuiz(stage: number) {
  store.value.startQuiz(stage)
  go('quiz', stage)
}

function toReviewList() {
  go('review')
}

function startReviewQuiz() {
  store.value.startReview()
  go('quiz')
}

function onQuizDone() {
  go(store.value.session.value?.mode === 'review' ? 'review-result' : 'result')
}

function onQuizAbort(target: 'map' | 'review') {
  store.value.clearSession()
  go(target)
}

function onReset() {
  if (typeof window === 'undefined') return
  if (window.confirm('确定要清空本机保存的闯关进度吗？该操作不可撤销。')) {
    store.value.reset()
    go('home')
  }
}
</script>

<template>
  <div class="challenge-app">
    <div class="cg-head">
      <div class="cg-head-title">
        {{ chapter.title }} · {{ chapter.subtitle }}
        <span>共 {{ chapter.stages.length }} 关</span>
      </div>
      <div class="cg-head-stats">
        <span>进度 <b>{{ passedCount }}/{{ chapter.stages.length }}</b></span>
        <span>星级 <b>{{ totalStars }}/{{ maxStars }}</b></span>
        <span>XP <b>{{ state.xp }}</b></span>
        <button class="cg-btn cg-btn-ghost cg-btn-sm" @click="onReset">重置进度</button>
      </div>
    </div>

    <HomeView
      v-if="view === 'home'"
      :store="store"
      @go="(target) => go(target)"
    />

    <StageMap
      v-else-if="view === 'map'"
      :store="store"
      @learn="toLearn"
      @quiz="toQuiz"
      @home="go('home')"
      @review="toReviewList"
      @badges="go('badges')"
    />

    <LearnView
      v-else-if="view === 'learn'"
      :store="store"
      :sid="sid"
      @map="go('map')"
      @quiz="toQuiz"
    />

    <QuizView
      v-else-if="view === 'quiz'"
      :store="store"
      @done="onQuizDone"
      @abort="onQuizAbort"
    />

    <ResultView
      v-else-if="view === 'result' || view === 'review-result'"
      :store="store"
      @map="go('map')"
      @learn="toLearn"
      @quiz="toQuiz"
      @review="toReviewList"
      @badges="go('badges')"
      @home="go('home')"
    />

    <ReviewView
      v-else-if="view === 'review'"
      :store="store"
      @start="startReviewQuiz"
      @map="go('map')"
      @home="go('home')"
      @badges="go('badges')"
    />

    <BadgeWall
      v-else-if="view === 'badges'"
      :store="store"
      @map="go('map')"
      @home="go('home')"
    />
  </div>
</template>
