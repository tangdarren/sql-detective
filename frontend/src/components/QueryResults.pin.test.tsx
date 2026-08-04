import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import QueryResults from './QueryResults'

describe('QueryResults pinning', () => {
  it('renders a Pin action for each result row', async () => {
    const user = userEvent.setup()
    const onPinRow = vi.fn()

    render(
      <QueryResults
        columns={['guest_name', 'room_number']}
        rows={[
          ['Clara Whitmore', 417],
          ['Ada Lovelace', 221],
        ]}
        levelNumber={2}
        onPinRow={onPinRow}
      />,
    )

    const pinButtons = screen.getAllByRole('button', { name: 'Pin' })
    expect(pinButtons).toHaveLength(2)

    await user.click(pinButtons[0])
    expect(onPinRow).toHaveBeenCalledWith({
      levelNumber: 2,
      columns: ['guest_name', 'room_number'],
      values: ['Clara Whitmore', '417'],
    })
  })

  it('formats null cells as NULL when pinning', async () => {
    const user = userEvent.setup()
    const onPinRow = vi.fn()

    render(
      <QueryResults
        columns={['note']}
        rows={[[null]]}
        levelNumber={1}
        onPinRow={onPinRow}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Pin' }))
    expect(onPinRow).toHaveBeenCalledWith({
      levelNumber: 1,
      columns: ['note'],
      values: ['NULL'],
    })
  })

  it('shows an inline message when the pin limit is reached', () => {
    render(
      <QueryResults
        columns={['id']}
        rows={[['1']]}
        levelNumber={1}
        onPinRow={vi.fn()}
        pinMessage="Notebook limit reached: you can pin up to 12 rows."
      />,
    )

    expect(
      screen.getByText('Notebook limit reached: you can pin up to 12 rows.'),
    ).toBeInTheDocument()
  })

  it('hides the Pin column when no pin callback is provided', () => {
    render(
      <QueryResults columns={['guest_name']} rows={[['Clara Whitmore']]} levelNumber={1} />,
    )

    expect(screen.queryByRole('button', { name: 'Pin' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Pin' })).not.toBeInTheDocument()
  })
})
