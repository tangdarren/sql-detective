import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CASE_01_ID,
  clearNotebookNotes,
  getNotebookNotes,
  saveNotebookNotes,
} from '../lib/notebookStorage'
import DetectiveNotebook from './DetectiveNotebook'

describe('DetectiveNotebook', () => {
  beforeEach(() => {
    clearNotebookNotes(CASE_01_ID)
    vi.restoreAllMocks()
  })

  it('saves notes to localStorage as the player types', async () => {
    const user = userEvent.setup()
    render(<DetectiveNotebook caseId={CASE_01_ID} />)

    await user.type(screen.getByLabelText('Investigation notes'), 'Check the lobby logs')

    expect(getNotebookNotes(CASE_01_ID)).toBe('Check the lobby logs')
  })

  it('restores saved notes on mount', () => {
    saveNotebookNotes(CASE_01_ID, 'Portrait was moved at midnight')

    render(<DetectiveNotebook caseId={CASE_01_ID} />)

    expect(screen.getByLabelText('Investigation notes')).toHaveValue(
      'Portrait was moved at midnight',
    )
  })

  it('clears notes after confirmation', async () => {
    const user = userEvent.setup()
    saveNotebookNotes(CASE_01_ID, 'Scratch notes')
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<DetectiveNotebook caseId={CASE_01_ID} />)

    await user.click(screen.getByRole('button', { name: 'Clear Notes' }))

    expect(window.confirm).toHaveBeenCalled()
    expect(screen.getByLabelText('Investigation notes')).toHaveValue('')
    expect(getNotebookNotes(CASE_01_ID)).toBe('')
  })

  it('keeps notes when clear is cancelled', async () => {
    const user = userEvent.setup()
    saveNotebookNotes(CASE_01_ID, 'Keep these')
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<DetectiveNotebook caseId={CASE_01_ID} />)

    await user.click(screen.getByRole('button', { name: 'Clear Notes' }))

    expect(screen.getByLabelText('Investigation notes')).toHaveValue('Keep these')
    expect(getNotebookNotes(CASE_01_ID)).toBe('Keep these')
  })
})
