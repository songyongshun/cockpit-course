<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Chapter } from './types'
import type { ProgressSummary } from './useChallenge'
import { CHAPTERS } from './data'
import { questionCount, readProgressSummary } from './useChallenge'

const list = ref(
  CHAPTERS.map((chapter) => ({
    chapter: chapter as Chapter,
    stages: chapter.stages.length,
    questions: questionCount(chapter as Chapter),
    maxStars: chapter.stages.length * 3,
    progress: {
      passed: 0,
      stars: 0,
      maxStars: chapter.stages.length * 3,
      xp: 0,
      wrong: 0,
      started: false
    } as ProgressSummary
  }))
)

onMounted(() => {
  list.value = list.value.map((item) => ({
    ...item,
    progress: readProgressSummary(item.chapter)
  }))
})

function linkOf(chapter: Chapter) {
  return `/challenge/${chapter.id}/`
}
</script>
<template>
  <div class="challenge-app cg-overview">
    <header class="cg-hero">
      <p class="cg-kicker">智能座舱系统装调与测试 · 闯关版</p>
      <h1 class="cg-title">闯关学习</h1>
      <p class="cg-sub">
        每个项目的讲义内容被拆成若干关卡：先读知识卡，再答题闯关。通过一关解锁下一关，答错的题自动收入错题本，星级、徽章与进度自动保存在本机，随时回来继续。
      </p>
      <div class="cg-head-stats">
        <span>项目 <b>{{ list.length }}</b></span>
        <span>关卡 <b>{{ list.reduce((n, c) => n + c.stages, 0) }}</b></span>
        <span>题库 <b>{{ list.reduce((n, c) => n + c.questions, 0) }}</b></span>
      </div>
    </header>

    <div class="cg-overview-grid">
      <a
        v-for="item in list"
        :key="item.chapter.id"
        class="cg-chapter-card"
        :href="linkOf(item.chapter)"
      >
        <div class="cg-chapter-top">
          <span class="cg-chapter-no">{{ item.chapter.title.split(/\s+/)[0] }}</span>
          <span class="cg-chapter-state" :class="{ done: item.progress.started }">
            {{ item.progress.started ? '进行中' : '未开始' }}
          </span>
        </div>
        <h3 class="cg-chapter-name">{{ item.chapter.title }}</h3>
        <p class="cg-chapter-desc">{{ item.chapter.subtitle }}</p>
        <dl class="cg-chapter-meta">
          <div>
            <dt>关卡</dt>
            <dd>{{ item.stages }} 关</dd>
          </div>
          <div>
            <dt>题库</dt>
            <dd>{{ item.questions }} 题</dd>
          </div>
          <div>
            <dt>星级</dt>
            <dd>★ {{ item.progress.stars }}/{{ item.maxStars }}</dd>
          </div>
          <div>
            <dt>XP</dt>
            <dd>{{ item.progress.xp }}</dd>
          </div>
        </dl>
        <div class="cg-chapter-cta">进入闯关 →</div>
      </a>
    </div>

    <div class="cg-note">
      <p><b>玩法说明</b></p>
      <ul>
        <li><span class="cg-num">1</span>进入某个项目后，先阅读该关知识卡，再点击「开始挑战」作答。</li>
        <li><span class="cg-num">2</span>得分率 ≥50% 过关（1 星）、≥70% 2 星、≥90% 3 星，过关后解锁下一关。</li>
        <li><span class="cg-num">3</span>答错的题自动进入错题本，可在复习模式里重做清零。</li>
        <li><span class="cg-num">4</span>进度、星级、徽章保存在浏览器本机（localStorage），换设备或清理缓存后需重新挑战。</li>
      </ul>
    </div>
  </div>
</template>
