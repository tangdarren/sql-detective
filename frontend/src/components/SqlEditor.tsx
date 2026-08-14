import { useState, type KeyboardEvent } from 'react'
import './SqlEditor.css'

type SqlEditorProps = {
  value: string
  onChange: (value: string) => void
  onRun: () => void
  onReset: () => void
  isRunning?: boolean
  disabled?: boolean
}

function SqlEditor({
  value,
  onChange,
  onRun,
  onReset,
  isRunning = false,
  disabled = false,
}: SqlEditorProps) {
  const [allowTabExit, setAllowTabExit] = useState(false)

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      setAllowTabExit(true)
      return
    }

    if (event.key === 'Tab') {
      if (allowTabExit) {
        setAllowTabExit(false)
        return
      }

      event.preventDefault()
      const target = event.currentTarget
      const start = target.selectionStart
      const end = target.selectionEnd
      const nextValue = `${value.slice(0, start)}  ${value.slice(end)}`
      onChange(nextValue)
      requestAnimationFrame(() => {
        target.selectionStart = start + 2
        target.selectionEnd = start + 2
      })
      return
    }

    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      if (!isRunning && !disabled) {
        onRun()
      }
      return
    }

    if (allowTabExit && event.key !== 'Shift') {
      setAllowTabExit(false)
    }
  }

  return (
    <section className="sql-editor" aria-labelledby="sql-editor-title">
      <div className="sql-editor__header">
        <h2 id="sql-editor-title" className="sql-editor__title">
          SQL Editor
        </h2>
        <div className="sql-editor__actions">
          <button
            type="button"
            className="sql-editor__reset"
            onClick={onReset}
            disabled={disabled || isRunning}
          >
            Reset Query
          </button>
          <button
            type="button"
            className="sql-editor__run"
            onClick={onRun}
            disabled={disabled || isRunning}
          >
            {isRunning ? 'Running…' : 'Run Query'}
          </button>
        </div>
      </div>
      <label className="sql-editor__label" htmlFor="sql-editor-input">
        Query
      </label>
      <textarea
        id="sql-editor-input"
        className="sql-editor__input"
        value={value}
        onChange={(event) => {
          setAllowTabExit(false)
          onChange(event.target.value)
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setAllowTabExit(false)}
        spellCheck={false}
        rows={10}
        disabled={disabled}
        aria-label="SQL query editor"
        aria-describedby="sql-editor-hints"
      />
      <p id="sql-editor-hints" className="sql-editor__shortcut">
        Press ⌘Enter or Ctrl+Enter to run. Press Esc, then Tab to leave the editor.
      </p>
    </section>
  )
}

export default SqlEditor
