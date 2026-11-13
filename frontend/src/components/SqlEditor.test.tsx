import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SqlEditor, { type SqlEditorHandle } from './SqlEditor'

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

describe('SqlEditor schema insert', () => {
  it('inserts an identifier at the remembered cursor position', async () => {
    const onChange = vi.fn()
    const editorRef = createRef<SqlEditorHandle>()
    const { rerender } = render(
      <SqlEditor
        ref={editorRef}
        value="SELECT  FROM guests"
        onChange={onChange}
        onRun={vi.fn()}
        onReset={vi.fn()}
      />,
    )

    const textarea = screen.getByLabelText('SQL query editor') as HTMLTextAreaElement
    textarea.focus()
    textarea.setSelectionRange(7, 7)
    fireEvent.select(textarea)

    act(() => {
      editorRef.current?.insertIdentifier('id')
    })

    expect(onChange).toHaveBeenCalledWith('SELECT id FROM guests')

    act(() => {
      rerender(
        <SqlEditor
          ref={editorRef}
          value="SELECT id FROM guests"
          onChange={onChange}
          onRun={vi.fn()}
          onReset={vi.fn()}
        />,
      )
    })

    expect(textarea.selectionStart).toBe(9)
    expect(textarea.selectionEnd).toBe(9)
  })

  it('appends an identifier when the editor was never focused', () => {
    const onChange = vi.fn()
    const editorRef = createRef<SqlEditorHandle>()
    render(
      <SqlEditor
        ref={editorRef}
        value="SELECT"
        onChange={onChange}
        onRun={vi.fn()}
        onReset={vi.fn()}
      />,
    )

    act(() => {
      editorRef.current?.insertIdentifier('guests')
    })

    expect(onChange).toHaveBeenCalledWith('SELECT guests')
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
