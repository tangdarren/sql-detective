import { beforeEach, describe, expect, it } from 'vitest'
import {
  CASE_01_ID,
  MAX_PINNED_EVIDENCE,
  buildPinnedEvidenceId,
  clearNotebook,
  getNotebookData,
  getNotebookNotes,
  getPinnedEvidence,
  pinEvidence,
  removePinnedEvidence,
  saveNotebookNotes,
} from './notebookStorage'

describe('notebookStorage', () => {
  beforeEach(() => {
    clearNotebook(CASE_01_ID)
    clearNotebook('case-02')
  })

  it('saves and restores notes for a case', () => {
    expect(getNotebookNotes(CASE_01_ID)).toBe('')
    saveNotebookNotes(CASE_01_ID, 'Suspect was in the lobby.')
    expect(getNotebookNotes(CASE_01_ID)).toBe('Suspect was in the lobby.')
  })

  it('keeps notes isolated per case id', () => {
    saveNotebookNotes(CASE_01_ID, 'Case 01 notes')
    saveNotebookNotes('case-02', 'Case 02 notes')
    expect(getNotebookNotes(CASE_01_ID)).toBe('Case 01 notes')
    expect(getNotebookNotes('case-02')).toBe('Case 02 notes')
  })

  it('clears the notebook for a case', () => {
    saveNotebookNotes(CASE_01_ID, 'Temporary notes')
    clearNotebook(CASE_01_ID)
    expect(getNotebookNotes(CASE_01_ID)).toBe('')
  })

  it('migrates plain-text notes into structured notebook data', () => {
    localStorage.setItem('sql-detective:case-01:notebook', 'Legacy freeform notes')
    expect(getNotebookData(CASE_01_ID)).toEqual({
      notes: 'Legacy freeform notes',
      pinnedEvidence: [],
    })
  })

  it('pins evidence alongside notes and restores both', () => {
    saveNotebookNotes(CASE_01_ID, 'Lobby lead')
    const pinned = pinEvidence(CASE_01_ID, {
      levelNumber: 2,
      columns: ['guest_name', 'room_number'],
      values: ['Clara Whitmore', '417'],
    })

    expect(pinned.ok).toBe(true)
    expect(getPinnedEvidence(CASE_01_ID)).toEqual([
      {
        id: buildPinnedEvidenceId(2, ['guest_name', 'room_number'], ['Clara Whitmore', '417']),
        levelNumber: 2,
        columns: ['guest_name', 'room_number'],
        values: ['Clara Whitmore', '417'],
      },
    ])
    expect(getNotebookNotes(CASE_01_ID)).toBe('Lobby lead')
  })

  it('prevents pinning the same row from the same level twice', () => {
    const payload = {
      levelNumber: 1,
      columns: ['full_name'],
      values: ['Ada'],
    }
    expect(pinEvidence(CASE_01_ID, payload).ok).toBe(true)
    const duplicate = pinEvidence(CASE_01_ID, payload)
    expect(duplicate.ok).toBe(false)
    if (!duplicate.ok) {
      expect(duplicate.reason).toBe('duplicate')
    }
    expect(getPinnedEvidence(CASE_01_ID)).toHaveLength(1)
  })

  it('allows the same values from a different level', () => {
    const columns = ['full_name']
    const values = ['Ada']
    expect(pinEvidence(CASE_01_ID, { levelNumber: 1, columns, values }).ok).toBe(true)
    expect(pinEvidence(CASE_01_ID, { levelNumber: 2, columns, values }).ok).toBe(true)
    expect(getPinnedEvidence(CASE_01_ID)).toHaveLength(2)
  })

  it('enforces the 12-row pinned evidence limit', () => {
    for (let index = 0; index < MAX_PINNED_EVIDENCE; index += 1) {
      const result = pinEvidence(CASE_01_ID, {
        levelNumber: 1,
        columns: ['id'],
        values: [String(index)],
      })
      expect(result.ok).toBe(true)
    }

    const overLimit = pinEvidence(CASE_01_ID, {
      levelNumber: 1,
      columns: ['id'],
      values: ['overflow'],
    })
    expect(overLimit.ok).toBe(false)
    if (!overLimit.ok) {
      expect(overLimit.reason).toBe('limit')
    }
    expect(getPinnedEvidence(CASE_01_ID)).toHaveLength(MAX_PINNED_EVIDENCE)
  })

  it('removes a single pinned clipping', () => {
    const first = pinEvidence(CASE_01_ID, {
      levelNumber: 1,
      columns: ['name'],
      values: ['Ada'],
    })
    expect(first.ok).toBe(true)
    if (!first.ok) {
      return
    }
    pinEvidence(CASE_01_ID, {
      levelNumber: 1,
      columns: ['name'],
      values: ['Grace'],
    })

    const remaining = removePinnedEvidence(CASE_01_ID, first.data.pinnedEvidence[0].id)
    expect(remaining.pinnedEvidence).toHaveLength(1)
    expect(remaining.pinnedEvidence[0].values).toEqual(['Grace'])
  })

  it('clears notes and clippings together', () => {
    saveNotebookNotes(CASE_01_ID, 'Keep digging')
    pinEvidence(CASE_01_ID, {
      levelNumber: 3,
      columns: ['door'],
      values: ['B2'],
    })
    clearNotebook(CASE_01_ID)
    expect(getNotebookData(CASE_01_ID)).toEqual({
      notes: '',
      pinnedEvidence: [],
    })
  })
})
