import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { insertSqlIdentifier } from '../lib/insertText'
import './SqlEditor.css'

type SqlEditorProps = {
  value: string
  onChange: (value: string) => void
  onRun: () => void
  onReset: () => void
  isRunning?: boolean
  disabled?: boolean
}

export type SqlEditorHandle = {
  insertIdentifier: (identifier: string) => void
}

const COPIED_FEEDBACK_MS = 1800

const SqlEditor = forwardRef<SqlEditorHandle, SqlEditorProps>(function SqlEditor(
  { value, onChange, onRun, onReset, isRunning = false, disabled = false },
  ref,
) {
  const [allowTabExit, setAllowTabExit] = useState(false)
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectionRef = useRef<{ start: number; end: number } | null>(null)
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null)
  const isEmpty = value.trim().length === 0

  useEffect(() => {
    return () => {
      if (copiedTimer.current != null) {
        window.clearTimeout(copiedTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    setCopied(false)
    if (copiedTimer.current != null) {
      window.clearTimeout(copiedTimer.current)
      copiedTimer.current = null
    }
  }, [value])

  useLayoutEffect(() => {
    const pending = pendingSelectionRef.current
    const textarea = textareaRef.current
    if (!pending || !textarea || textarea.disabled) {
      return
    }

    pendingSelectionRef.current = null
    textarea.focus()
    textarea.setSelectionRange(pending.start, pending.end)
    selectionRef.current = pending
  }, [value])

  function rememberSelection() {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }
    selectionRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    }
  }

  useImperativeHandle(ref, () => ({
    insertIdentifier(identifier: string) {
      if (disabled) {
        return
      }

      const selection = selectionRef.current
      const start = selection?.start ?? value.length
      const end = selection?.end ?? value.length
      const insertion = insertSqlIdentifier(value, start, end, identifier)

      selectionRef.current = {
        start: insertion.selectionStart,
        end: insertion.selectionEnd,
      }
      pendingSelectionRef.current = {
        start: insertion.selectionStart,
        end: insertion.selectionEnd,
      }
      onChange(insertion.value)
    },
  }))

  async function handleCopySql() {
    if (isEmpty || disabled) {
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      if (copiedTimer.current != null) {
        window.clearTimeout(copiedTimer.current)
      }
      copiedTimer.current = window.setTimeout(() => {
        setCopied(false)
        copiedTimer.current = null
      }, COPIED_FEEDBACK_MS)
    } catch {
      setCopied(false)
    }
  }

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
      selectionRef.current = { start: start + 2, end: start + 2 }
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
            onClick={() => {
              void handleCopySql()
            }}
            disabled={disabled || isEmpty}
            aria-label={copied ? 'SQL copied to clipboard' : 'Copy SQL to clipboard'}
          >
            {copied ? 'Copied' : 'Copy SQL'}
          </button>
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
        ref={textareaRef}
        id="sql-editor-input"
        className="sql-editor__input"
        value={value}
        onChange={(event) => {
          setAllowTabExit(false)
          onChange(event.target.value)
          selectionRef.current = {
            start: event.target.selectionStart,
            end: event.target.selectionEnd,
          }
        }}
        onSelect={rememberSelection}
        onClick={rememberSelection}
        onKeyUp={rememberSelection}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          rememberSelection()
          setAllowTabExit(false)
        }}
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
})

export default SqlEditor
