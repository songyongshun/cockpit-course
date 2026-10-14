import { computed, reactive, ref, watch } from 'vue'
import type { Badge, Chapter, ProgressState, QuizRef, QuizResult, WrongItem } from './types'

/** 徽章墙定义（覆盖「学完 / 过关 / 满星 / 错题」四类成就） */
export const BADGES: Badge[] = [
  { id: 'b1', name: '初入座舱', desc: '通过第 1 关', emoji: '🚗' },
  { id: 'b2', name: '勤学不辍', desc: '学完全部知识卡', emoji: '📚' },
  { id: 'b3', name: '过半征程', desc: '通过一半关卡', emoji: '⛳' },
  { id: 'b4', name: '完美一关', desc: '任一关卡获得 3 星', emoji: '⭐' },
  { id: 'b5', name: '满星通关', desc: '全部关卡满星', emoji: '👑' },
  { id: 'b6', name: '错题清零', desc: '在复习模式中重做并答对所有错题', emoji: '🛡️' }
]

/** 测验会话（模块级单例，切换视图不丢失当前作答进度） */
interface QuizSession {
  mode: 'stage' | 'review'
  sid: number
  queue: QuizRef[]
  idx: number
  score: number
  picked: number | null
  answered: boolean
  wrongItems: WrongItem[]
  result: QuizResult | null
}

function defaultState(size: number): ProgressState {
  return {
    stars: new Array(size).fill(0),
    best: new Array(size).fill(0),
    attempts: new Array(size).fill(0),
    learned: new Array(size).fill(false),
    passed: new Array(size).fill(false),
    xp: 0,
    wrong: [],
    badges: [],
    reviewCleared: false
  }
}

function storageKey(chapter: Chapter) {
  return progressKey(chapter.id)
}

/** localStorage key：按章节 id 生成，总览页与状态机共用同一套 key */
export function progressKey(chapterId: string) {
  return `cockpit-challenge-${chapterId}-progress-v1`
}

/** 章节题目总数 */
export function questionCount(chapter: Chapter) {
  return chapter.stages.reduce((sum, s) => sum + s.quiz.length, 0)
}

/** 进度摘要（只读，不创建 store，供总览页使用） */
export interface ProgressSummary {
  passed: number
  stars: number
  maxStars: number
  xp: number
  wrong: number
  /** 是否有过任何学习/闯关记录 */
  started: boolean
}

export function readProgressSummary(chapter: Chapter): ProgressSummary {
  const total = chapter.stages.length
  const empty: ProgressSummary = {
    passed: 0,
    stars: 0,
    maxStars: total * 3,
    xp: 0,
    wrong: 0,
    started: false
  }
  if (typeof window === 'undefined') return empty
  try {
    const raw = window.localStorage.getItem(progressKey(chapter.id))
    if (!raw) return empty
    const data = JSON.parse(raw) as Partial<ProgressState>
    const passedArr = data.passed ?? []
    const starsArr = data.stars ?? []
    const learnedArr = data.learned ?? []
    const passed = passedArr.filter(Boolean).length
    const stars = starsArr.reduce((a, b) => a + (b || 0), 0)
    return {
      passed,
      stars,
      maxStars: total * 3,
      xp: data.xp ?? 0,
      wrong: (data.wrong ?? []).length,
      started: passed > 0 || stars > 0 || learnedArr.some(Boolean)
    }
  } catch {
    return empty
  }
}

/** 根据得分率换算星级：≥90% 三星、≥70% 两星、≥50% 一星（即过关） */
export function starsOf(pct: number) {
  return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0
}

function createStore(chapter: Chapter) {
  const size = chapter.stages.length
  const session = ref<QuizSession | null>(null)
  /** 每关知识卡当前翻到第几张 */
  const learnPos = reactive<Record<number, number>>({})

  function load(): ProgressState {
    const def = defaultState(size)
    if (typeof window === 'undefined') return def
    try {
      const raw = window.localStorage.getItem(storageKey(chapter))
      if (!raw) return def
      const data = JSON.parse(raw) as Partial<ProgressState>
      // 结构合并，兼容关卡数量变化后的旧数据
      const merged = { ...def, ...data } as ProgressState
      for (const key of ['stars', 'best', 'attempts', 'learned', 'passed'] as const) {
        const arr = merged[key] as unknown[]
        if (!Array.isArray(arr) || arr.length !== size) {
          merged[key] = def[key].map((v, i) => arr?.[i] ?? v) as never
        }
      }
      if (!Array.isArray(merged.wrong)) merged.wrong = []
      if (!Array.isArray(merged.badges)) merged.badges = []
      return merged
    } catch {
      return def
    }
  }

  const state = reactive<ProgressState>(load())

  // 状态变化后写回 localStorage
  watch(
    state,
    (val) => {
      if (typeof window === 'undefined') return
      try {
        window.localStorage.setItem(storageKey(chapter), JSON.stringify(val))
      } catch {
        /* 隐私模式等场景下忽略写入失败 */
      }
    },
    { deep: true }
  )

  /** 关卡状态：locked（未解锁） / ready（可学习） / done（已通过） */
  function stageState(sid: number): 'locked' | 'ready' | 'done' {
    if (state.passed[sid - 1]) return 'done'
    if (sid === 1 || state.passed[sid - 2]) return 'ready'
    return 'locked'
  }

  const passedCount = computed(() => state.passed.filter(Boolean).length)
  const currentStage = computed(() => {
    const idx = state.passed.findIndex((p) => !p)
    return idx === -1 ? size : idx + 1
  })
  const totalStars = computed(() => state.stars.reduce((a, b) => a + b, 0))
  const maxStars = computed(() => size * 3)

  function reset() {
    Object.assign(state, defaultState(size))
    session.value = null
    for (const key of Object.keys(learnPos)) delete learnPos[Number(key)]
  }

  function markLearned(sid: number) {
    if (!state.learned[sid - 1]) state.learned[sid - 1] = true
    syncBadges()
  }

  function questionOf(ref_: QuizRef) {
    return chapter.stages[ref_.sid - 1].quiz[ref_.qid]
  }

  function clearSession() {
    session.value = null
  }

  /* ---------------- 测验 ---------------- */

  function startQuiz(sid: number) {
    const stage = chapter.stages[sid - 1]
    session.value = {
      mode: 'stage',
      sid,
      queue: stage.quiz.map((_, qid) => ({ sid, qid })),
      idx: 0,
      score: 0,
      picked: null,
      answered: false,
      wrongItems: [],
      result: null
    }
  }

  function startReview() {
    const queue = state.wrong.map((w) => ({ sid: w.sid, qid: w.qid }))
    session.value = {
      mode: 'review',
      sid: 0,
      queue,
      idx: 0,
      score: 0,
      picked: null,
      answered: false,
      wrongItems: [],
      result: null
    }
  }

  function pick(option: number) {
    const s = session.value
    if (!s || s.answered) return
    s.picked = option
    s.answered = true
    const ref_ = s.queue[s.idx]
    if (option === questionOf(ref_).a) {
      s.score += 10
    } else {
      s.wrongItems.push({ sid: ref_.sid, qid: ref_.qid, picked: option })
    }
  }

  function next() {
    const s = session.value
    if (!s || !s.answered) return
    if (s.idx >= s.queue.length - 1) {
      finish()
      return
    }
    s.idx += 1
    s.picked = null
    s.answered = false
  }

  function finish() {
    const s = session.value
    if (!s) return
    const total = s.queue.length
    const correct = Math.round(s.score / 10)
    const pct = total ? Math.round((correct / total) * 100) : 0
    const stars = starsOf(pct)
    const passed = stars >= 1

    if (s.mode === 'stage') {
      const { sid } = s
      state.attempts[sid - 1] += 1
      if (pct > state.best[sid - 1]) state.best[sid - 1] = pct
      if (stars > state.stars[sid - 1]) state.stars[sid - 1] = stars
      let bonus = 0
      if (passed && !state.passed[sid - 1]) {
        state.passed[sid - 1] = true
        bonus = 30
      }
      state.xp += s.score + bonus
      for (const w of s.wrongItems) {
        const idx = state.wrong.findIndex((x) => x.sid === w.sid && x.qid === w.qid)
        if (idx === -1) state.wrong.push({ ...w })
        else state.wrong[idx] = { ...w }
      }
    } else {
      state.xp += s.score
      // 复习模式：答对的题从错题本移除，答错的保留并更新所选
      for (const ref_ of s.queue) {
        const wrong = s.wrongItems.find((w) => w.sid === ref_.sid && w.qid === ref_.qid)
        const idx = state.wrong.findIndex((w) => w.sid === ref_.sid && w.qid === ref_.qid)
        if (wrong) {
          if (idx >= 0) state.wrong[idx] = { ...wrong }
        } else if (idx >= 0) {
          state.wrong.splice(idx, 1)
        }
      }
      if (total > 0 && s.wrongItems.length === 0) state.reviewCleared = true
    }

    s.result = {
      mode: s.mode,
      sid: s.sid,
      total,
      correct,
      pct,
      stars,
      passed,
      wrongCount: s.wrongItems.length,
      wrongItems: [...s.wrongItems]
    }
    syncBadges()
  }

  /** 依据当前进度刷新徽章 */
  function syncBadges() {
    const unlock = (id: string, ok: boolean) => {
      if (ok && !state.badges.includes(id)) state.badges.push(id)
    }
    unlock('b1', state.passed[0] === true)
    unlock('b2', state.learned.length > 0 && state.learned.every(Boolean))
    unlock('b3', passedCount.value >= Math.ceil(size / 2))
    unlock('b4', state.stars.some((v) => v >= 3))
    unlock('b5', state.stars.every((v) => v >= 3))
    unlock('b6', state.reviewCleared && state.wrong.length === 0)
  }

  return {
    chapter,
    state,
    session,
    learnPos,
    stageState,
    passedCount,
    currentStage,
    totalStars,
    maxStars,
    markLearned,
    startQuiz,
    startReview,
    pick,
    next,
    questionOf,
    clearSession,
    reset
  }
}

export type ChallengeStore = ReturnType<typeof createStore>

const cache = new Map<string, ChallengeStore>()

/** 获取（或创建）某章节的闯关状态 */
export function useChallenge(chapter: Chapter): ChallengeStore {
  let store = cache.get(chapter.id)
  if (!store) {
    store = createStore(chapter)
    cache.set(chapter.id, store)
  }
  return store
}
