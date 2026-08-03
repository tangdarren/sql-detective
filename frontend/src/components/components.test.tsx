import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import CaseBriefing from './CaseBriefing'
import CaseHeader from './CaseHeader'
import ConfidentialStamp from './ConfidentialStamp'
import EvidencePhoto from './EvidencePhoto'
import LevelNavigation from './LevelNavigation'
import PrimaryButton from './PrimaryButton'
import QueryResults from './QueryResults'
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

  it('renders LevelNavigation and handles selection', async () => {
    const user = userEvent.setup()
    const onSelectLevel = vi.fn()

    render(
      <LevelNavigation
        levels={[
          { id: 1, title: 'Guest Log' },
          { id: 2, title: 'Room Access' },
        ]}
        activeLevelId={1}
        onSelectLevel={onSelectLevel}
      />,
    )

    expect(screen.getByRole('navigation', { name: 'Investigation levels' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Room Access/i }))
    expect(onSelectLevel).toHaveBeenCalledWith(2)
  })

  it('renders CaseBriefing', () => {
    render(<CaseBriefing title="Guest Log" objective="List every guest registered." />)

    expect(screen.getByRole('heading', { name: 'Objective' })).toBeInTheDocument()
    expect(screen.getByText('Guest Log')).toBeInTheDocument()
    expect(screen.getByText('List every guest registered.')).toBeInTheDocument()
  })

  it('renders SqlEditor and runs a query', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onRun = vi.fn()

    render(<SqlEditor value="SELECT 1;" onChange={onChange} onRun={onRun} />)

    expect(screen.getByRole('heading', { name: 'SQL Editor' })).toBeInTheDocument()
    expect(screen.getByLabelText('Query')).toHaveValue('SELECT 1;')

    await user.click(screen.getByRole('button', { name: 'Run Query' }))
    expect(onRun).toHaveBeenCalled()
  })

  it('renders QueryResults empty and populated states', () => {
    const { rerender } = render(<QueryResults rows={[]} />)

    expect(screen.getByText(/No results yet/i)).toBeInTheDocument()

    rerender(
      <QueryResults
        rows={[
          { guest_name: 'Clara Whitmore', room_number: 417 },
        ]}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'guest_name' })).toBeInTheDocument()
    expect(screen.getByText('Clara Whitmore')).toBeInTheDocument()
    expect(screen.getByText('417')).toBeInTheDocument()
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
