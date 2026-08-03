import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { renderWithRouter } from './test/renderWithRouter'

describe('App navigation', () => {
  it('renders the landing page', () => {
    renderWithRouter(<App />, { route: '/' })

    expect(screen.getByRole('heading', { name: 'SQL Detective.' })).toBeInTheDocument()
    expect(screen.getByText('Query the evidence. Solve the case.')).toBeInTheDocument()
    expect(
      screen.getByText(/Investigate fictional crimes by writing real SQL queries/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start Investigation' })).toBeInTheDocument()
  })

  it('navigates to the case introduction page', async () => {
    const user = userEvent.setup()
    renderWithRouter(<App />, { route: '/' })

    await user.click(screen.getByRole('link', { name: 'Start Investigation' }))

    expect(
      screen.getByRole('heading', { name: 'Case 01: The Blackwood Hotel' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/valuable painting vanished from Room 417/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Case File' })).toBeInTheDocument()
  })

  it('navigates to the investigation workspace', async () => {
    const user = userEvent.setup()
    renderWithRouter(<App />, { route: '/case/01' })

    await user.click(screen.getByRole('link', { name: 'Open Case File' }))

    expect(screen.getByText('Investigation Workspace')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Objective' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'SQL Editor' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Query Results' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Investigation levels' })).toBeInTheDocument()
  })
})
