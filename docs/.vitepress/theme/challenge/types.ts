/**
 * 「闯关学习」模块的数据类型定义。
 *
 * 设计参考 https://4m1s73pzbhd26.aiforce.cloud/app/app_17e695danhv/ 的实现方式：
 * 一个章节（Chapter）由若干关卡（Stage）组成，关卡内先给知识卡（cards），
 * 再进入答题闯关（quiz），得分率决定星级并通过关卡。
 */

/** 单道测试题 */
export interface QuizQuestion {
  /** 题干 */
  q: string
  /** 选项（一般为 4 项） */
  opts: string[]
  /** 正确选项下标（从 0 开始） */
  a: number
  /** 答案解析 */
  ex: string
  /** 考点标签 */
  tag: string
}

/** 知识卡中的插图，src 指向 docs/public 下的静态资源 */
export interface CardFigure {
  src: string
  caption: string
}

/** 知识卡：一张卡对应一个知识点 */
export interface KnowledgeCard {
  /** 知识卡标签，如「概念辨析」 */
  tag: string
  /** 知识卡标题 */
  title: string
  /** 知识卡正文（HTML 片段） */
  html: string
  /** 知识卡插图 */
  figures?: CardFigure[]
}

/** 关卡 */
export interface Stage {
  /** 关卡序号，从 1 开始 */
  id: number
  /** 展示用编号，如 "01" */
  num: string
  /** 关卡标题 */
  title: string
  /** 对应讲义小节号，如 "4.1~4.10" */
  sec: string
  /** 对应讲义小节名称 */
  secName: string
  /** 关卡简介 */
  desc: string
  /** 过关要求说明 */
  passNote: string
  /** 对应讲义页面 */
  source: { text: string; link: string }
  /** 知识卡列表 */
  cards: KnowledgeCard[]
  /** 题库 */
  quiz: QuizQuestion[]
}

/** 章节（一个项目对应一个章节） */
export interface Chapter {
  /** 章节 id，同时用于 localStorage key，如 "chapter-01" */
  id: string
  /** 章节标题 */
  title: string
  /** 副标题 */
  subtitle: string
  /** 首页 kicker 文案 */
  kicker: string
  /** 首页导语 */
  intro: string
  /** 首页统计信息 */
  stats: { label: string; value: string }[]
  /** 关卡列表 */
  stages: Stage[]
}

/** 错题记录 */
export interface WrongItem {
  /** 关卡序号（1 开始） */
  sid: number
  /** 题目下标（0 开始） */
  qid: number
  /** 上次选错的选项下标 */
  picked: number
}

/** 进度状态，序列化到 localStorage */
export interface ProgressState {
  /** 每关星级 0~3 */
  stars: number[]
  /** 每关最佳得分率（%） */
  best: number[]
  /** 每关挑战次数 */
  attempts: number[]
  /** 是否翻看过该关知识卡 */
  learned: boolean[]
  /** 是否通过该关 */
  passed: boolean[]
  /** 累计经验值 */
  xp: number
  /** 错题本 */
  wrong: WrongItem[]
  /** 已解锁徽章 id */
  badges: string[]
  /** 是否完成过一次错题清零 */
  reviewCleared: boolean
}

/** 测验会话中的一条待答题 */
export interface QuizRef {
  sid: number
  qid: number
}

/** 测验结果 */
export interface QuizResult {
  mode: 'stage' | 'review'
  sid: number
  total: number
  correct: number
  pct: number
  stars: number
  passed: boolean
  wrongCount: number
  wrongItems: WrongItem[]
}

/** 徽章定义 */
export interface Badge {
  id: string
  name: string
  desc: string
  /** 用 emoji 表示，避免引入图标依赖 */
  emoji: string
}
