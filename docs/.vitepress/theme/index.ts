import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import ChallengeApp from './challenge/ChallengeApp.vue'
import ChallengeOverview from './challenge/ChallengeOverview.vue'
import './challenge/challenge.css'

/**
 * 自定义主题：在 VitePress 默认主题基础上，注册「闯关学习」组件。
 * 讲义页面仍走默认主题，不受影响。
 */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ChallengeApp', ChallengeApp)
    app.component('ChallengeOverview', ChallengeOverview)
  }
} satisfies Theme
