const COMPLETED_KEY = 'sql-detective:blackwood:completedLevels'
const DRAFTS_KEY = 'sql-detective:blackwood:drafts'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function getCompletedLevels(): number[] {
  const levels = readJson<number[]>(COMPLETED_KEY, [])
  return [...new Set(levels.filter((level) => Number.isInteger(level) && level > 0))].sort(
    (a, b) => a - b,
  )
}

export function markLevelCompleted(levelNumber: number): number[] {
  const next = [...new Set([...getCompletedLevels(), levelNumber])].sort((a, b) => a - b)
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(next))
  return next
}

export function getHighestUnlockedLevel(totalLevels: number): number {
  if (totalLevels <= 0) {
    return 1
  }
  const completed = getCompletedLevels()
  if (completed.length === 0) {
    return 1
  }
  return Math.min(totalLevels, Math.max(...completed) + 1)
}

export function isLevelUnlocked(levelNumber: number, totalLevels: number): boolean {
  return levelNumber <= getHighestUnlockedLevel(totalLevels)
}

export function getDraft(levelNumber: number): string | null {
  const drafts = readJson<Record<string, string>>(DRAFTS_KEY, {})
  return drafts[String(levelNumber)] ?? null
}

export function saveDraft(levelNumber: number, query: string): void {
  const drafts = readJson<Record<string, string>>(DRAFTS_KEY, {})
  drafts[String(levelNumber)] = query
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
}

export function clearDraft(levelNumber: number): void {
  const drafts = readJson<Record<string, string>>(DRAFTS_KEY, {})
  delete drafts[String(levelNumber)]
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
}

export function resetProgress(): void {
  localStorage.removeItem(COMPLETED_KEY)
  localStorage.removeItem(DRAFTS_KEY)
}
