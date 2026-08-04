import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QueryResults from './QueryResults'

describe('QueryResults pinning', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders accessible Pin actions for each result row', async () => {
    const user = userEvent.setup()
    const onPinRow = vi.fn(() => true)

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

    const pinButtons = screen.getAllByRole('button', { name: /Pin row \d+ as notebook evidence/ })
    expect(pinButtons).toHaveLength(2)

    await user.click(pinButtons[0])
    expect(onPinRow).toHaveBeenCalledWith({
      levelNumber: 2,
      columns: ['guest_name', 'room_number'],
      values: ['Clara Whitmore', '417'],
    })
  })

  it('temporarily shows Filed after a successful pin', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onPinRow = vi.fn(() => true)

    render(
      <QueryResults
        columns={['guest_name']}
        rows={[['Clara Whitmore']]}
        levelNumber={1}
        onPinRow={onPinRow}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Pin row 1 as notebook evidence' }))

    expect(screen.getByRole('button', { name: 'Row 1 filed in notebook' })).toHaveTextContent(
      'Filed',
    )
    expect(screen.getByRole('button', { name: 'Row 1 filed in notebook' })).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(1800)
    })

    expect(screen.getByRole('button', { name: 'Pin row 1 as notebook evidence' })).toHaveTextContent(
      'Pin',
    )
  })

  it('does not show Filed when pinning fails', async () => {
    const user = userEvent.setup()
    const onPinRow = vi.fn(() => false)

    render(
      <QueryResults
        columns={['guest_name']}
        rows={[['Clara Whitmore']]}
        levelNumber={1}
        onPinRow={onPinRow}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Pin row 1 as notebook evidence' }))

    expect(screen.getByRole('button', { name: 'Pin row 1 as notebook evidence' })).toHaveTextContent(
      'Pin',
    )
    expect(screen.queryByRole('button', { name: 'Row 1 filed in notebook' })).not.toBeInTheDocument()
  })

  it('formats null cells as NULL when pinning', async () => {
    const user = userEvent.setup()
    const onPinRow = vi.fn(() => true)

    render(
      <QueryResults columns={['note']} rows={[[null]]} levelNumber={1} onPinRow={onPinRow} />,
    )

    await user.click(screen.getByRole('button', { name: 'Pin row 1 as notebook evidence' }))
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
        onPinRow={vi.fn(() => false)}
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

    expect(screen.queryByRole('button', { name: /Pin row/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Pin' })).not.toBeInTheDocument()
  })

  it('keeps many columns scrollable while preserving the Pin column', () => {
    const columns = Array.from({ length: 12 }, (_, index) => `col_${index + 1}`)
    const row = columns.map((_, index) => `value_${index + 1}`)

    const { container } = render(
      <QueryResults columns={columns} rows={[row]} levelNumber={1} onPinRow={vi.fn(() => true)} />,
    )

    expect(container.querySelector('.query-results__table-wrap')).toBeInTheDocument()
    expect(container.querySelector('.query-results__pin-col')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pin row 1 as notebook evidence' })).toBeInTheDocument()
  })
})
