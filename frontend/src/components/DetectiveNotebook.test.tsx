import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CASE_01_ID,
  MAX_PINNED_EVIDENCE,
  clearNotebook,
  getNotebookData,
  getNotebookNotes,
  getPinnedEvidence,
  pinEvidence,
  removePinnedEvidence,
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
      onRemoveClipping={(evidenceId) => {
        const next = removePinnedEvidence(CASE_01_ID, evidenceId)
        setNotes(next.notes)
        setPinnedEvidence(next.pinnedEvidence)
      }}
      onClearNotebook={() => {
        clearNotebook(CASE_01_ID)
        setNotes('')
        setPinnedEvidence([])
      }}
    />
  )
}

describe('DetectiveNotebook', () => {
  beforeEach(() => {
    clearNotebook(CASE_01_ID)
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

  it('displays stored clipping values as filed records', () => {
    render(
      <NotebookHarness
        initialPinned={[
          {
            id: 'clip-1',
            levelNumber: 2,
            columns: ['guest_name', 'room_number', 'is_vip', 'checked_out', 'note'],
            values: ['Clara Whitmore', '417', 'true', 'NULL', '2024-01-15'],
          },
        ]}
      />,
    )

    expect(screen.getByText('Evidence Clippings')).toBeInTheDocument()
    expect(screen.getByText('1 / 12 clippings')).toBeInTheDocument()
    expect(screen.getByText('Discovered · Level 2')).toBeInTheDocument()
    expect(screen.getByText('guest_name')).toBeInTheDocument()
    expect(screen.getByText('Clara Whitmore')).toBeInTheDocument()
    expect(screen.getByText('417')).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
    expect(screen.getByText('NULL')).toBeInTheDocument()
    expect(screen.getByText('2024-01-15')).toBeInTheDocument()
  })

  it('removes a single evidence clipping', async () => {
    const user = userEvent.setup()
    pinEvidence(CASE_01_ID, {
      levelNumber: 1,
      columns: ['name'],
      values: ['Ada'],
    })
    pinEvidence(CASE_01_ID, {
      levelNumber: 1,
      columns: ['name'],
      values: ['Grace'],
    })
    const data = getNotebookData(CASE_01_ID)

    render(<NotebookHarness initialNotes={data.notes} initialPinned={data.pinnedEvidence} />)

    expect(screen.getByText('2 / 12 clippings')).toBeInTheDocument()

    const firstClipping = screen.getByText('Ada').closest('li')
    expect(firstClipping).not.toBeNull()
    await user.click(within(firstClipping as HTMLElement).getByRole('button', { name: 'Remove' }))

    expect(screen.queryByText('Ada')).not.toBeInTheDocument()
    expect(screen.getByText('Grace')).toBeInTheDocument()
    expect(screen.getByText('1 / 12 clippings')).toBeInTheDocument()
    expect(getPinnedEvidence(CASE_01_ID)).toHaveLength(1)
  })

  it('clears the complete notebook after confirmation', async () => {
    const user = userEvent.setup()
    saveNotebookNotes(CASE_01_ID, 'Scratch notes')
    pinEvidence(CASE_01_ID, {
      levelNumber: 3,
      columns: ['door'],
      values: ['B2'],
    })
    const data = getNotebookData(CASE_01_ID)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<NotebookHarness initialNotes={data.notes} initialPinned={data.pinnedEvidence} />)

    await user.click(screen.getByRole('button', { name: 'Clear Notebook' }))

    expect(window.confirm).toHaveBeenCalled()
    expect(screen.getByLabelText('Investigation notes')).toHaveValue('')
    expect(screen.getByText(`0 / ${MAX_PINNED_EVIDENCE} clippings`)).toBeInTheDocument()
    expect(screen.queryByText('B2')).not.toBeInTheDocument()
    expect(getNotebookData(CASE_01_ID)).toEqual({ notes: '', pinnedEvidence: [] })
  })

  it('keeps notebook content when clear is cancelled', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(
      <NotebookHarness
        initialNotes="Keep these"
        initialPinned={[
          {
            id: 'keep',
            levelNumber: 1,
            columns: ['name'],
            values: ['Ada'],
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear Notebook' }))

    expect(screen.getByLabelText('Investigation notes')).toHaveValue('Keep these')
    expect(screen.getByText('Ada')).toBeInTheDocument()
  })

  it('preserves clippings when notes change', async () => {
    const user = userEvent.setup()
    pinEvidence(CASE_01_ID, {
      levelNumber: 1,
      columns: ['name'],
      values: ['Ada'],
    })
    const data = getNotebookData(CASE_01_ID)

    render(<NotebookHarness initialNotes={data.notes} initialPinned={data.pinnedEvidence} />)

    await user.type(screen.getByLabelText('Investigation notes'), ' lead')

    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(getNotebookData(CASE_01_ID).pinnedEvidence).toHaveLength(1)
    expect(getNotebookNotes(CASE_01_ID)).toContain('lead')
  })
})
