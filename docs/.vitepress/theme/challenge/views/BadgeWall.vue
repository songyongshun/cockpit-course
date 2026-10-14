<script setup lang="ts">
import type { ChallengeStore } from '../useChallenge'
import { BADGES } from '../useChallenge'

const props = defineProps<{ store: ChallengeStore }>()
const emit = defineEmits<{ map: []; home: [] }>()

const { state, passedCount, totalStars, maxStars } = props.store
</script>

<template>
  <section class="cg-section" style="margin-top: 0">
    <h3 class="cg-section-title">
      徽章墙：已解锁 {{ state.badges.length }} / {{ BADGES.length }}
    </h3>

    <div class="cg-grid" style="margin-bottom: 18px">
      <div class="cg-tile">
        <h4>累计经验值（XP）</h4>
        <p>{{ state.xp }} XP</p>
      </div>
      <div class="cg-tile">
        <h4>关卡进度</h4>
        <p>已通过 {{ passedCount }} 关</p>
      </div>
      <div class="cg-tile">
        <h4>星级收集</h4>
        <p>{{ totalStars }} / {{ maxStars }} 星</p>
      </div>
    </div>

    <div class="cg-badge-grid">
      <div
        v-for="b in BADGES"
        :key="b.id"
        class="cg-badge"
        :class="{ off: !state.badges.includes(b.id) }"
      >
        <div class="cg-badge-emoji">{{ state.badges.includes(b.id) ? b.emoji : '🔒' }}</div>
        <h4>{{ b.name }}</h4>
        <p>{{ b.desc }}</p>
      </div>
    </div>

    <div class="cg-foot-actions" style="margin-top: 18px">
      <button class="cg-btn cg-btn-primary cg-btn-sm" @click="emit('map')">返回关卡地图</button>
      <button class="cg-btn cg-btn-ghost cg-btn-sm" @click="emit('home')">返回首页</button>
    </div>
  </section>
</template>
