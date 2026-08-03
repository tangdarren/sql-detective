import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { getCompletedLevels, markLevelCompleted, resetProgress } from '../lib/progressStorage'
import { renderWithRouter } from '../test/renderWithRouter'
import App from '../App'
import CaseCompletionPage from './CaseCompletionPage'

describe('CaseCompletionPage', () => {
  beforeEach(() => {
    resetProgress()
  })

  it('redirects away when the case is not complete', () => {
    renderWithRouter(<CaseCompletionPage />, { route: '/case/01/complete' })
    expect(screen.queryByText('CASE CLOSED')).not.toBeInTheDocument()
    expect(screen.queryByText('Julian Pike')).not.toBeInTheDocument()
  })

  it('shows the case closed report when all levels are complete', () => {
    for (let level = 1; level <= 5; level += 1) {
      markLevelCompleted(level)
    }

    renderWithRouter(<CaseCompletionPage />, { route: '/case/01/complete' })

    expect(screen.getByText('CASE CLOSED')).toBeInTheDocument()
    expect(screen.getByText('Julian Pike')).toBeInTheDocument()
    expect(screen.getByText(/Access logs placed a guest/i)).toBeInTheDocument()
    expect(screen.getByText(/Level 5: Identify the Thief/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play Again' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Return to Case File' })).toHaveAttribute(
      'href',
      '/case/01',
    )
  })

  it('resets progress when Play Again is clicked', async () => {
    const user = userEvent.setup()
    for (let level = 1; level <= 5; level += 1) {
      markLevelCompleted(level)
    }

    renderWithRouter(<App />, { route: '/case/01/complete' })
    await user.click(screen.getByRole('button', { name: 'Play Again' }))

    expect(getCompletedLevels()).toEqual([])
  })
})
