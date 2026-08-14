import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SqlEditor from './SqlEditor'

describe('SqlEditor keyboard accessibility', () => {
  it('inserts spaces when Tab is pressed by default', () => {
    const onChange = vi.fn()
    render(
      <SqlEditor value="SELECT" onChange={onChange} onRun={vi.fn()} onReset={vi.fn()} />,
    )

    const editor = screen.getByLabelText('SQL query editor')
    editor.focus()
    fireEvent.keyDown(editor, { key: 'Tab' })

    expect(onChange).toHaveBeenCalledWith('  SELECT')
  })

  it('lets Tab leave the editor after Escape instead of inserting spaces', () => {
    const onChange = vi.fn()
    render(
      <>
        <button type="button">Before</button>
        <SqlEditor value="SELECT" onChange={onChange} onRun={vi.fn()} onReset={vi.fn()} />
        <button type="button">After</button>
      </>,
    )

    const editor = screen.getByLabelText('SQL query editor')
    editor.focus()
    fireEvent.keyDown(editor, { key: 'Escape' })
    fireEvent.keyDown(editor, { key: 'Tab' })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('lets Shift+Tab leave the editor after Escape', () => {
    const onChange = vi.fn()
    render(
      <>
        <button type="button">Before</button>
        <SqlEditor value="SELECT" onChange={onChange} onRun={vi.fn()} onReset={vi.fn()} />
      </>,
    )

    const editor = screen.getByLabelText('SQL query editor')
    editor.focus()
    fireEvent.keyDown(editor, { key: 'Escape' })
    fireEvent.keyDown(editor, { key: 'Tab', shiftKey: true })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('restores Tab-to-indent after normal editing resumes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SqlEditor value="SELECT" onChange={onChange} onRun={vi.fn()} onReset={vi.fn()} />,
    )

    const editor = screen.getByLabelText('SQL query editor')
    editor.focus()
    fireEvent.keyDown(editor, { key: 'Escape' })
    await user.type(editor, ' ')
    onChange.mockClear()

    fireEvent.keyDown(editor, { key: 'Tab' })
    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls.some(([next]) => typeof next === 'string' && next.includes('  '))).toBe(
      true,
    )
  })

  it('restores Tab-to-indent after the editor loses focus', () => {
    const onChange = vi.fn()
    render(
      <>
        <SqlEditor value="SELECT" onChange={onChange} onRun={vi.fn()} onReset={vi.fn()} />
        <button type="button">Outside</button>
      </>,
    )

    const editor = screen.getByLabelText('SQL query editor')
    editor.focus()
    fireEvent.keyDown(editor, { key: 'Escape' })
    fireEvent.blur(editor)
    editor.focus()
    fireEvent.keyDown(editor, { key: 'Tab' })

    expect(onChange).toHaveBeenCalledWith('  SELECT')
  })

  it('shows an accessibility hint for leaving the editor', () => {
    render(<SqlEditor value="SELECT 1;" onChange={vi.fn()} onRun={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByText(/Press Esc, then Tab to leave the editor/i)).toBeInTheDocument()
    expect(screen.getByLabelText('SQL query editor')).toHaveAttribute(
      'aria-describedby',
      'sql-editor-hints',
    )
  })
})

describe('SqlEditor copy action', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('copies the current SQL to the clipboard and shows temporary confirmation', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText },
    })

    render(
      <SqlEditor
        value="SELECT full_name FROM guests;"
        onChange={vi.fn()}
        onRun={vi.fn()}
        onReset={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy SQL to clipboard' }))

    expect(writeText).toHaveBeenCalledWith('SELECT full_name FROM guests;')
    expect(screen.getByRole('button', { name: 'SQL copied to clipboard' })).toHaveTextContent(
      'Copied',
    )

    act(() => {
      vi.advanceTimersByTime(1800)
    })

    expect(screen.getByRole('button', { name: 'Copy SQL to clipboard' })).toHaveTextContent(
      'Copy SQL',
    )
  })

  it('disables Copy SQL when the editor is empty', () => {
    render(<SqlEditor value="   " onChange={vi.fn()} onRun={vi.fn()} onReset={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Copy SQL to clipboard' })).toBeDisabled()
  })

  it('clears Copied confirmation when the query changes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText },
    })

    const { rerender } = render(
      <SqlEditor
        value="SELECT 1;"
        onChange={vi.fn()}
        onRun={vi.fn()}
        onReset={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Copy SQL to clipboard' }))
    expect(screen.getByRole('button', { name: 'SQL copied to clipboard' })).toHaveTextContent(
      'Copied',
    )

    rerender(
      <SqlEditor
        value="SELECT 2;"
        onChange={vi.fn()}
        onRun={vi.fn()}
        onReset={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Copy SQL to clipboard' })).toHaveTextContent(
      'Copy SQL',
    )
  })
})
