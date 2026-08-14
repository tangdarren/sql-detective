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

function mockMatchMedia(matchesNarrow: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matchesNarrow && query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

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
    mockMatchMedia(false)
  })

  it('opens by default on larger screens and can be closed', async () => {
    const user = userEvent.setup()
    render(<NotebookHarness />)

    expect(screen.getByLabelText('Investigation notes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close Detective Notebook' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.click(screen.getByRole('button', { name: 'Close Detective Notebook' }))

    expect(screen.queryByLabelText('Investigation notes')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open Detective Notebook' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByText('0 / 12 clippings')).toBeInTheDocument()
  })

  it('starts collapsed on narrow screens and can be opened', async () => {
    mockMatchMedia(true)
    const user = userEvent.setup()
    render(<NotebookHarness />)

    expect(screen.queryByLabelText('Investigation notes')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open Detective Notebook' })).toBeInTheDocument()
    expect(screen.getByText('0 / 12 clippings')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open Detective Notebook' }))

    expect(screen.getByLabelText('Investigation notes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close Detective Notebook' })).toBeInTheDocument()
  })

  it('exposes accessible labels for notebook controls', async () => {
    const user = userEvent.setup()
    render(
      <NotebookHarness
        initialPinned={[
          {
            id: 'clip-1',
            levelNumber: 2,
            columns: ['guest_name'],
            values: ['Clara'],
          },
        ]}
      />,
    )

    expect(screen.getByLabelText('Investigation notes')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Clear notebook notes and evidence clippings' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Remove evidence clipping 1 from level 2' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close Detective Notebook' }))
    expect(screen.getByRole('button', { name: 'Open Detective Notebook' })).toBeInTheDocument()
  })

  it('shows the clipping count', () => {
    render(
      <NotebookHarness
        initialPinned={[
          {
            id: 'clip-1',
            levelNumber: 1,
            columns: ['name'],
            values: ['Ada'],
          },
          {
            id: 'clip-2',
            levelNumber: 2,
            columns: ['name'],
            values: ['Grace'],
          },
        ]}
      />,
    )

    expect(screen.getByText(`2 / ${MAX_PINNED_EVIDENCE} clippings`)).toBeInTheDocument()
  })

  it('wraps long evidence values without breaking layout', () => {
    const longValue = `evidence-${'x'.repeat(220)}`

    const { container } = render(
      <NotebookHarness
        initialPinned={[
          {
            id: 'long',
            levelNumber: 4,
            columns: ['remark'],
            values: [longValue],
          },
        ]}
      />,
    )

    expect(screen.getByText(longValue)).toBeInTheDocument()
    expect(container.querySelector('.detective-notebook')).toHaveClass('detective-notebook')
    expect(container.querySelector('.detective-notebook__clipping-value')).toHaveTextContent(
      longValue,
    )
  })

  it('saves notes to localStorage as the player types', async () => {
    const user = userEvent.setup()
    render(<NotebookHarness />)

    await user.type(screen.getByLabelText('Investigation notes'), 'Check the lobby logs')

    expect(getNotebookNotes(CASE_01_ID)).toBe('Check the lobby logs')
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
    expect(screen.getByText('NULL')).toBeInTheDocument()
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

    const firstClipping = screen.getByText('Ada').closest('li')
    expect(firstClipping).not.toBeNull()
    await user.click(
      within(firstClipping as HTMLElement).getByRole('button', {
        name: /Remove evidence clipping/,
      }),
    )

    expect(screen.queryByText('Ada')).not.toBeInTheDocument()
    expect(screen.getByText('Grace')).toBeInTheDocument()
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

    await user.click(
      screen.getByRole('button', { name: 'Clear notebook notes and evidence clippings' }),
    )

    expect(window.confirm).toHaveBeenCalled()
    expect(screen.getByLabelText('Investigation notes')).toHaveValue('')
    expect(screen.getByText(`0 / ${MAX_PINNED_EVIDENCE} clippings`)).toBeInTheDocument()
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

    await user.click(
      screen.getByRole('button', { name: 'Clear notebook notes and evidence clippings' }),
    )

    expect(screen.getByLabelText('Investigation notes')).toHaveValue('Keep these')
    expect(screen.getByText('Ada')).toBeInTheDocument()
  })
})
