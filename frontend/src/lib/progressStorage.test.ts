import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearDraft,
  getCompletedLevels,
  getDraft,
  getHighestUnlockedLevel,
  markLevelCompleted,
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

  it('resets progress and drafts together', () => {
    markLevelCompleted(1)
    saveDraft(1, 'SELECT 1;')
    resetProgress()
    expect(getCompletedLevels()).toEqual([])
    expect(getDraft(1)).toBeNull()
  })
})
