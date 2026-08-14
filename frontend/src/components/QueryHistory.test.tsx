import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import QueryHistory from './QueryHistory'

describe('QueryHistory', () => {
  it('shows a shortened preview for long queries', () => {
    const longQuery = `SELECT ${'column, '.repeat(20)}id FROM guests;`

    render(
      <QueryHistory queries={[longQuery]} onSelect={vi.fn()} onClear={vi.fn()} />,
    )

    const preview = screen.getByText(/SELECT column,/i)
    expect(preview.textContent?.endsWith('…')).toBe(true)
    expect((preview.textContent ?? '').length).toBeLessThanOrEqual(72)
  })

  it('restores a query when an entry is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <QueryHistory
        queries={['SELECT full_name FROM guests;', 'SELECT 1;']}
        onSelect={onSelect}
        onClear={vi.fn()}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /Restore query: SELECT full_name FROM guests;/i }),
    )
    expect(onSelect).toHaveBeenCalledWith('SELECT full_name FROM guests;')
  })

  it('clears history for the current level', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()

    render(
      <QueryHistory queries={['SELECT 1;']} onSelect={vi.fn()} onClear={onClear} />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear query history for this level' }))
    expect(onClear).toHaveBeenCalled()
  })

  it('disables clear when there is no history', () => {
    render(<QueryHistory queries={[]} onSelect={vi.fn()} onClear={vi.fn()} />)

    expect(screen.getByText('No recent queries for this level.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear query history for this level' })).toBeDisabled()
  })
})
