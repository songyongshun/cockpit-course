import type { Chapter } from '../types'
import chapter01 from './chapter-01'
import chapter02 from './chapter-02'
import chapter03 from './chapter-03'
import chapter04 from './chapter-04'
import chapter05 from './chapter-05'

/**
 * 闯关章节注册表：数据驱动，新章节只需在 data/ 下新增
 * chapter-0X.ts 并在此登记，无需改动组件。
 */
export const CHAPTERS: Chapter[] = [chapter01, chapter02, chapter03, chapter04, chapter05]

/** 按 id 查找章节；未指定或找不到时回退到第一章 */
export function findChapter(id?: string): Chapter | undefined {
  if (!id) return CHAPTERS[0]
  return CHAPTERS.find((c) => c.id === id)
}

export default CHAPTERS
