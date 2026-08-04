import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/types'
import {
  getCompletedLevels,
  getDraft,
  markLevelCompleted,
  resetProgress,
  saveDraft,
} from '../lib/progressStorage'
import {
  CASE_01_ID,
  clearNotebook,
  getNotebookData,
  getNotebookNotes,
  getPinnedEvidence,
  pinEvidence,
  saveNotebookNotes,
} from '../lib/notebookStorage'
import { renderWithRouter } from '../test/renderWithRouter'
import {
  correctExecution,
  finalLevelExecution,
  forbiddenExecution,
  incorrectExecution,
  mockCase,
  mockChallengeDetails,
  mockChallengeSummaries,
  mockTableDetails,
  mockTables,
  syntaxErrorExecution,
} from '../test/apiMocks'
import InvestigationWorkspacePage from './InvestigationWorkspacePage'

const {
  fetchCase,
  fetchChallenges,
  fetchChallenge,
  fetchTables,
  fetchTable,
  executeQuery,
} = vi.hoisted(() => ({
  fetchCase: vi.fn(),
  fetchChallenges: vi.fn(),
  fetchChallenge: vi.fn(),
  fetchTables: vi.fn(),
  fetchTable: vi.fn(),
  executeQuery: vi.fn(),
}))

vi.mock('../api/client', () => ({
  fetchCase,
  fetchChallenges,
  fetchChallenge,
  fetchTables,
  fetchTable,
  executeQuery,
}))

function mockSuccessfulWorkspaceLoad() {
  fetchCase.mockResolvedValue(mockCase)
  fetchChallenges.mockResolvedValue(mockChallengeSummaries)
  fetchTables.mockResolvedValue(mockTables)
  fetchChallenge.mockImplementation(async (level: number) => mockChallengeDetails[level])
  fetchTable.mockResolvedValue(mockTableDetails)
}

async function renderWorkspace(expectedTitle = 'The Guest Registry') {
  const view = renderWithRouter(<InvestigationWorkspacePage />, {
    route: '/case/01/investigate',
  })
  expect(await screen.findByText(/Investigation Workspace/i)).toBeInTheDocument()
  expect(await screen.findByRole('heading', { name: expectedTitle })).toBeInTheDocument()
  return view
}

describe('InvestigationWorkspacePage', () => {
  beforeEach(() => {
    resetProgress()
    clearNotebook(CASE_01_ID)
    vi.clearAllMocks()
    mockSuccessfulWorkspaceLoad()
  })

  it('loads a challenge from the API', async () => {
    await renderWorkspace()

    expect(screen.getByRole('heading', { name: 'Case 01: The Blackwood Hotel' })).toBeInTheDocument()
    expect(screen.getByText(/Start with the guest registry/i)).toBeInTheDocument()
    expect(screen.getByText(/List fourth-floor guests/i)).toBeInTheDocument()
    expect(screen.getByLabelText('SQL query editor')).toHaveValue(
      mockChallengeDetails[1].starterQuery,
    )
  })

  it('displays available tables and columns', async () => {
    const user = userEvent.setup()
    await renderWorkspace()

    expect(screen.getByRole('button', { name: 'guests' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'employees' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'guests' }))

    expect(await screen.findByText('guests columns')).toBeInTheDocument()
    expect(screen.getByText('full_name')).toBeInTheDocument()
    expect(screen.getByText('room_number')).toBeInTheDocument()
    expect(screen.getAllByText('integer').length).toBeGreaterThan(0)
  })

  it('runs a correct query and unlocks the next level', async () => {
    const user = userEvent.setup()
    executeQuery.mockResolvedValue(correctExecution)
    await renderWorkspace()

    expect(screen.getByRole('button', { name: /The Missing Master Key/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Run Query' }))

    expect(await screen.findByText('CASE SOLVED')).toBeInTheDocument()
    expect(
      screen.getByText(/Several guests stayed on the fourth floor near Room 417 that night/i),
    ).toBeInTheDocument()
    expect(getCompletedLevels()).toEqual([1])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /The Missing Master Key/i })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Continue Investigation' }))
    expect(await screen.findByRole('heading', { name: 'The Missing Master Key' })).toBeInTheDocument()
  })

  it('shows incorrect-answer feedback', async () => {
    const user = userEvent.setup()
    executeQuery.mockResolvedValue(incorrectExecution)
    await renderWorkspace()

    await user.click(screen.getByRole('button', { name: 'Run Query' }))

    expect(await screen.findByText('Not quite')).toBeInTheDocument()
    expect(screen.getByText('Check which columns the objective requests.')).toBeInTheDocument()
    expect(screen.queryByText('CASE SOLVED')).not.toBeInTheDocument()
  })

  it('shows syntax error feedback', async () => {
    const user = userEvent.setup()
    executeQuery.mockResolvedValue(syntaxErrorExecution)
    await renderWorkspace()

    await user.click(screen.getByRole('button', { name: 'Run Query' }))

    expect(await screen.findByText('Syntax error')).toBeInTheDocument()
    expect(screen.getByText('Your SQL contains a syntax error near JOIN.')).toBeInTheDocument()
  })

  it('shows forbidden-query feedback', async () => {
    const user = userEvent.setup()
    executeQuery.mockResolvedValue(forbiddenExecution)
    await renderWorkspace()

    await user.click(screen.getByRole('button', { name: 'Run Query' }))

    expect(await screen.findByText('Query blocked')).toBeInTheDocument()
    expect(screen.getByText('Only read-only SELECT queries are allowed.')).toBeInTheDocument()
  })

  it('saves a SQL draft', async () => {
    await renderWorkspace()

    const editor = screen.getByLabelText('SQL query editor')
    fireEvent.change(editor, { target: { value: 'SELECT full_name FROM guests;' } })

    expect(getDraft(1)).toBe('SELECT full_name FROM guests;')
  })

  it('restores a SQL draft', async () => {
    saveDraft(1, 'SELECT room_number FROM guests;')

    await renderWorkspace()

    expect(screen.getByLabelText('SQL query editor')).toHaveValue(
      'SELECT room_number FROM guests;',
    )
  })

  it('resets progress, drafts, and notebook data', async () => {
    const user = userEvent.setup()
    saveDraft(1, 'SELECT 1;')
    localStorage.setItem('sql-detective:blackwood:completedLevels', JSON.stringify([1]))
    saveNotebookNotes(CASE_01_ID, 'Restart should wipe notes')
    pinEvidence(CASE_01_ID, {
      levelNumber: 1,
      columns: ['guest_name'],
      values: ['Clara Whitmore'],
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    await renderWorkspace('The Missing Master Key')

    expect(getCompletedLevels()).toEqual([1])
    expect(getNotebookNotes(CASE_01_ID)).toBe('Restart should wipe notes')
    expect(getPinnedEvidence(CASE_01_ID)).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Restart Case' }))

    expect(getCompletedLevels()).toEqual([])
    expect(getDraft(1)).toBeNull()
    expect(getNotebookData(CASE_01_ID)).toEqual({ notes: '', pinnedEvidence: [] })
    expect(window.confirm).toHaveBeenCalled()
    expect(await screen.findByRole('heading', { name: 'The Guest Registry' })).toBeInTheDocument()
    expect(screen.getByText(/Investigation Workspace · Level 1/i)).toBeInTheDocument()
    expect(screen.getByText('0 / 12 clippings')).toBeInTheDocument()
  })

  it('handles an unavailable backend', async () => {
    fetchCase.mockRejectedValue(new ApiError('down', 0))
    fetchChallenges.mockRejectedValue(new ApiError('down', 0))
    fetchTables.mockRejectedValue(new ApiError('down', 0))

    renderWithRouter(<InvestigationWorkspacePage />, { route: '/case/01/investigate' })

    expect(await screen.findByRole('heading', { name: 'Archive unavailable' })).toBeInTheDocument()
    expect(
      screen.getByText(/The investigation server could not be reached/i),
    ).toBeInTheDocument()
  })

  it('offers case closure after the final level is solved', async () => {
    const user = userEvent.setup()
    for (let level = 1; level <= 4; level += 1) {
      markLevelCompleted(level)
    }
    executeQuery.mockResolvedValue(finalLevelExecution)

    await renderWorkspace('Identify the Thief')

    await user.click(screen.getByRole('button', { name: 'Run Query' }))
    expect(await screen.findByRole('button', { name: 'Close the Case' })).toBeInTheDocument()
  })
})
