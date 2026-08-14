const COMPLETED_KEY = 'sql-detective:blackwood:completedLevels'
const DRAFTS_KEY = 'sql-detective:blackwood:drafts'
const HISTORY_KEY = 'sql-detective:blackwood:queryHistory'

export const MAX_QUERY_HISTORY = 5

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

function normalizeHistory(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .slice(0, MAX_QUERY_HISTORY)
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

export function getQueryHistory(levelNumber: number): string[] {
  const history = readJson<Record<string, unknown>>(HISTORY_KEY, {})
  return normalizeHistory(history[String(levelNumber)])
}

export function pushQueryHistory(levelNumber: number, query: string): string[] {
  const trimmed = query.trim()
  const history = readJson<Record<string, unknown>>(HISTORY_KEY, {})
  const key = String(levelNumber)
  const current = normalizeHistory(history[key])

  if (!trimmed) {
    return current
  }
  if (current[0] === trimmed) {
    return current
  }

  const next = [trimmed, ...current].slice(0, MAX_QUERY_HISTORY)
  history[key] = next
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  return next
}

export function clearQueryHistory(levelNumber: number): void {
  const history = readJson<Record<string, unknown>>(HISTORY_KEY, {})
  delete history[String(levelNumber)]
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function resetProgress(): void {
  localStorage.removeItem(COMPLETED_KEY)
  localStorage.removeItem(DRAFTS_KEY)
  localStorage.removeItem(HISTORY_KEY)
}

export function areAllLevelsCompleted(totalLevels: number): boolean {
  if (totalLevels <= 0) {
    return false
  }
  const completed = new Set(getCompletedLevels())
  for (let level = 1; level <= totalLevels; level += 1) {
    if (!completed.has(level)) {
      return false
    }
  }
  return true
}
