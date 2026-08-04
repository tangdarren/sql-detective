import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CASE_01_ID,
  clearNotebookNotes,
  getNotebookData,
  getNotebookNotes,
  pinEvidence,
  saveNotebookNotes,
  type PinnedEvidence,
} from '../lib/notebookStorage'
import DetectiveNotebook from './DetectiveNotebook'

function NotebookHarness({
  initialNotes = '',
  initialPinned = [],
}: {
  initialNotes?: string
  initialPinned?: PinnedEvidence[]
}) {
  const [notes, setNotes] = useState(initialNotes)
  const [pinnedEvidence, setPinnedEvidence] = useState(initialPinned)

  return (
    <DetectiveNotebook
      caseId={CASE_01_ID}
      notes={notes}
      pinnedEvidence={pinnedEvidence}
      onNotesChange={(value) => {
        const next = saveNotebookNotes(CASE_01_ID, value)
        setNotes(next.notes)
        setPinnedEvidence(next.pinnedEvidence)
      }}
      onClear={() => {
        clearNotebookNotes(CASE_01_ID)
        setNotes('')
        setPinnedEvidence([])
      }}
    />
  )
}

describe('DetectiveNotebook', () => {
  beforeEach(() => {
    clearNotebookNotes(CASE_01_ID)
    vi.restoreAllMocks()
  })

  it('saves notes to localStorage as the player types', async () => {
    const user = userEvent.setup()
    render(<NotebookHarness />)

    await user.type(screen.getByLabelText('Investigation notes'), 'Check the lobby logs')

    expect(getNotebookNotes(CASE_01_ID)).toBe('Check the lobby logs')
  })

  it('restores saved notes on mount', () => {
    render(<NotebookHarness initialNotes="Portrait was moved at midnight" />)

    expect(screen.getByLabelText('Investigation notes')).toHaveValue(
      'Portrait was moved at midnight',
    )
  })

  it('renders pinned evidence from props', () => {
    render(
      <NotebookHarness
        initialPinned={[
          {
            id: '1',
            levelNumber: 2,
            columns: ['guest_name', 'room_number'],
            values: ['Clara Whitmore', '417'],
          },
        ]}
      />,
    )

    expect(screen.getByText('Level 2')).toBeInTheDocument()
    expect(screen.getByText('guest_name=Clara Whitmore · room_number=417')).toBeInTheDocument()
  })

  it('clears notes after confirmation', async () => {
    const user = userEvent.setup()
    saveNotebookNotes(CASE_01_ID, 'Scratch notes')
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<NotebookHarness initialNotes="Scratch notes" />)

    await user.click(screen.getByRole('button', { name: 'Clear Notes' }))

    expect(window.confirm).toHaveBeenCalled()
    expect(screen.getByLabelText('Investigation notes')).toHaveValue('')
    expect(getNotebookNotes(CASE_01_ID)).toBe('')
  })

  it('keeps notes when clear is cancelled', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<NotebookHarness initialNotes="Keep these" />)

    await user.click(screen.getByRole('button', { name: 'Clear Notes' }))

    expect(screen.getByLabelText('Investigation notes')).toHaveValue('Keep these')
  })

  it('preserves pinned evidence when notes change', async () => {
    const user = userEvent.setup()
    pinEvidence(CASE_01_ID, {
      levelNumber: 1,
      columns: ['name'],
      values: ['Ada'],
    })
    const data = getNotebookData(CASE_01_ID)

    render(<NotebookHarness initialNotes={data.notes} initialPinned={data.pinnedEvidence} />)

    await user.type(screen.getByLabelText('Investigation notes'), ' lead')

    expect(screen.getByText('name=Ada')).toBeInTheDocument()
    expect(getNotebookData(CASE_01_ID).pinnedEvidence).toHaveLength(1)
    expect(getNotebookNotes(CASE_01_ID)).toContain('lead')
  })
})
