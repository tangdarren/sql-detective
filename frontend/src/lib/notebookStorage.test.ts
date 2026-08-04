import { beforeEach, describe, expect, it } from 'vitest'
import {
  CASE_01_ID,
  clearNotebookNotes,
  getNotebookNotes,
  saveNotebookNotes,
} from './notebookStorage'

describe('notebookStorage', () => {
  beforeEach(() => {
    clearNotebookNotes(CASE_01_ID)
    clearNotebookNotes('case-02')
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

  it('clears notes for a case', () => {
    saveNotebookNotes(CASE_01_ID, 'Temporary notes')
    clearNotebookNotes(CASE_01_ID)
    expect(getNotebookNotes(CASE_01_ID)).toBe('')
  })
})
