import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_QUERY_HISTORY,
  clearDraft,
  clearQueryHistory,
  getCompletedLevels,
  getDraft,
  getHighestUnlockedLevel,
  getQueryHistory,
  markLevelCompleted,
  pushQueryHistory,
  resetProgress,
  saveDraft,
} from './progressStorage'

describe('progressStorage', () => {
  beforeEach(() => {
    resetProgress()
  })

  it('tracks completed levels and unlocks the next one', () => {
    expect(getHighestUnlockedLevel(5)).toBe(1)
    markLevelCompleted(1)
    expect(getCompletedLevels()).toEqual([1])
    expect(getHighestUnlockedLevel(5)).toBe(2)
  })

  it('saves, reads, and clears drafts', () => {
    saveDraft(2, 'SELECT 1;')
    expect(getDraft(2)).toBe('SELECT 1;')
    clearDraft(2)
    expect(getDraft(2)).toBeNull()
  })

  it('stores recent queries per level without consecutive duplicates', () => {
    expect(pushQueryHistory(1, 'SELECT 1;')).toEqual(['SELECT 1;'])
    expect(pushQueryHistory(1, 'SELECT 1;')).toEqual(['SELECT 1;'])
    expect(pushQueryHistory(1, 'SELECT 2;')).toEqual(['SELECT 2;', 'SELECT 1;'])
    expect(pushQueryHistory(2, 'SELECT level2;')).toEqual(['SELECT level2;'])
    expect(getQueryHistory(1)).toEqual(['SELECT 2;', 'SELECT 1;'])
    expect(getQueryHistory(2)).toEqual(['SELECT level2;'])
  })

  it('keeps only the five most recent queries for a level', () => {
    for (let index = 1; index <= MAX_QUERY_HISTORY + 2; index += 1) {
      pushQueryHistory(1, `SELECT ${index};`)
    }

    expect(getQueryHistory(1)).toEqual([
      `SELECT ${MAX_QUERY_HISTORY + 2};`,
      `SELECT ${MAX_QUERY_HISTORY + 1};`,
      `SELECT ${MAX_QUERY_HISTORY};`,
      `SELECT ${MAX_QUERY_HISTORY - 1};`,
      `SELECT ${MAX_QUERY_HISTORY - 2};`,
    ])
  })

  it('clears query history for a single level', () => {
    pushQueryHistory(1, 'SELECT 1;')
    pushQueryHistory(2, 'SELECT 2;')
    clearQueryHistory(1)
    expect(getQueryHistory(1)).toEqual([])
    expect(getQueryHistory(2)).toEqual(['SELECT 2;'])
  })

  it('resets progress, drafts, and query history together', () => {
    markLevelCompleted(1)
    saveDraft(1, 'SELECT 1;')
    pushQueryHistory(1, 'SELECT 1;')
    resetProgress()
    expect(getCompletedLevels()).toEqual([])
    expect(getDraft(1)).toBeNull()
    expect(getQueryHistory(1)).toEqual([])
  })
})
