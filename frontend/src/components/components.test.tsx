import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import CaseBriefing from './CaseBriefing'
import CaseHeader from './CaseHeader'
import ConfidentialStamp from './ConfidentialStamp'
import EvidenceIllustration from './EvidenceIllustration'
import EvidencePhoto from './EvidencePhoto'
import LevelNavigation from './LevelNavigation'
import PrimaryButton from './PrimaryButton'
import QueryFeedback from './QueryFeedback'
import QueryResults from './QueryResults'
import SchemaExplorer from './SchemaExplorer'
import SqlEditor from './SqlEditor'

describe('major components', () => {
  it('renders CaseHeader', () => {
    render(<CaseHeader title="Case 01: The Blackwood Hotel" subtitle="The Missing Portrait" />)

    expect(
      screen.getByRole('heading', { name: 'Case 01: The Blackwood Hotel' }),
    ).toBeInTheDocument()
    expect(screen.getByText('The Missing Portrait')).toBeInTheDocument()
  })

  it('renders EvidencePhoto with caption', () => {
    render(
      <EvidencePhoto caption="Crime scene sketch">
        <img alt="placeholder" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
      </EvidencePhoto>,
    )

    expect(screen.getByText('Crime scene sketch')).toBeInTheDocument()
    expect(screen.getByAltText('placeholder')).toBeInTheDocument()
  })

  it('renders EvidenceIllustration from local assets', () => {
    render(<EvidenceIllustration filename="hotel-exterior.svg" />)
    expect(screen.getByAltText(/Blackwood Hotel exterior/i)).toBeInTheDocument()
  })

  it('renders LevelNavigation and handles selection', async () => {
    const user = userEvent.setup()
    const onSelectLevel = vi.fn()

    render(
      <LevelNavigation
        levels={[
          { id: 1, title: 'Guest Log' },
          { id: 2, title: 'Room Access', locked: true },
        ]}
        activeLevelId={1}
        onSelectLevel={onSelectLevel}
      />,
    )

    expect(screen.getByRole('navigation', { name: 'Investigation levels' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Room Access/i })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /Guest Log/i }))
    expect(onSelectLevel).toHaveBeenCalledWith(1)
  })

  it('renders CaseBriefing with optional hint', async () => {
    const user = userEvent.setup()
    const onToggleHint = vi.fn()

    render(
      <CaseBriefing
        levelNumber={1}
        title="Guest Log"
        storyText="Start with the registry."
        objective="List every guest registered."
        hint="Order by room number."
        showHint={false}
        onToggleHint={onToggleHint}
      />,
    )

    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Guest Log' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Objective' })).toBeInTheDocument()
    expect(screen.getByText('List every guest registered.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show Hint' }))
    expect(onToggleHint).toHaveBeenCalled()
  })

  it('renders SqlEditor and runs a query', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onRun = vi.fn()
    const onReset = vi.fn()

    render(
      <SqlEditor value="SELECT 1;" onChange={onChange} onRun={onRun} onReset={onReset} />,
    )

    expect(screen.getByRole('heading', { name: 'SQL Editor' })).toBeInTheDocument()
    expect(screen.getByLabelText('SQL query editor')).toHaveValue('SELECT 1;')

    await user.click(screen.getByRole('button', { name: 'Run Query' }))
    expect(onRun).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Reset Query' }))
    expect(onReset).toHaveBeenCalled()
  })

  it('disables Run Query while processing', () => {
    render(
      <SqlEditor
        value="SELECT 1;"
        onChange={vi.fn()}
        onRun={vi.fn()}
        onReset={vi.fn()}
        isRunning
      />,
    )

    expect(screen.getByRole('button', { name: 'Running…' })).toBeDisabled()
  })

  it('renders QueryResults empty and populated states', () => {
    const { rerender } = render(<QueryResults columns={[]} rows={[]} />)

    expect(screen.getByText(/No results yet/i)).toBeInTheDocument()

    rerender(
      <QueryResults
        columns={['guest_name', 'room_number']}
        rows={[['Clara Whitmore', 417]]}
        rowCount={1}
        executionTimeMs={14}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'guest_name' })).toBeInTheDocument()
    expect(screen.getByText('Clara Whitmore')).toBeInTheDocument()
    expect(screen.getByText('417')).toBeInTheDocument()
    expect(screen.getByText('1 row(s)')).toBeInTheDocument()
    expect(screen.getByText('14 ms')).toBeInTheDocument()
  })

  it('renders SchemaExplorer tables and columns', async () => {
    const user = userEvent.setup()
    const onSelectTable = vi.fn()

    render(
      <SchemaExplorer
        tables={[
          { name: 'guests', description: 'Guests' },
          { name: 'employees', description: 'Staff' },
        ]}
        selectedTable="guests"
        columns={[
          { name: 'full_name', dataType: 'text', nullable: false, defaultValue: null },
          { name: 'room_number', dataType: 'integer', nullable: false, defaultValue: null },
        ]}
        onSelectTable={onSelectTable}
      />,
    )

    expect(screen.getByRole('button', { name: 'guests' })).toBeInTheDocument()
    expect(screen.getByText('guests columns')).toBeInTheDocument()
    expect(screen.getByText('full_name')).toBeInTheDocument()
    expect(screen.getByText('text')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'employees' }))
    expect(onSelectTable).toHaveBeenCalledWith('employees')
  })

  it('renders QueryFeedback for success and errors', () => {
    const onCloseCase = vi.fn()
    const { rerender } = render(
      <QueryFeedback
        correct
        feedback="Clue unlocked."
        hasNextLevel
        onContinue={vi.fn()}
      />,
    )

    expect(screen.getByText('CASE SOLVED')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue Investigation' })).toBeInTheDocument()

    rerender(
      <QueryFeedback
        correct
        feedback="Final clue."
        hasNextLevel={false}
        onContinue={vi.fn()}
        onCloseCase={onCloseCase}
      />,
    )

    expect(screen.getByRole('button', { name: 'Close the Case' })).toBeInTheDocument()

    rerender(
      <QueryFeedback
        correct={false}
        feedback="Only SELECT is allowed."
        errorType="FORBIDDEN_STATEMENT"
        hasNextLevel={false}
        onContinue={vi.fn()}
      />,
    )

    expect(screen.getByText('Query blocked')).toBeInTheDocument()
  })

  it('renders ConfidentialStamp', () => {
    render(<ConfidentialStamp />)
    expect(screen.getByText('CONFIDENTIAL')).toBeInTheDocument()
  })

  it('renders PrimaryButton as a link', () => {
    render(
      <MemoryRouter>
        <PrimaryButton to="/case/01">Start Investigation</PrimaryButton>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Start Investigation' })).toHaveAttribute(
      'href',
      '/case/01',
    )
  })
})
