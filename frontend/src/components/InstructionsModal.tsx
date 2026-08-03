import { useEffect, useId, useRef } from 'react'
import PrimaryButton from './PrimaryButton'
import './InstructionsModal.css'

type InstructionsModalProps = {
  open: boolean
  onClose: () => void
}

function InstructionsModal({ open, onClose }: InstructionsModalProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    closeRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="instructions-modal" role="presentation" onClick={onClose}>
      <div
        className="instructions-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="instructions-modal__header">
          <h2 id={titleId}>How to investigate</h2>
          <button
            ref={closeRef}
            type="button"
            className="instructions-modal__close"
            onClick={onClose}
            aria-label="Close instructions"
          >
            Close
          </button>
        </div>

        <ol className="instructions-modal__list">
          <li>Read the case briefing and SQL objective for the current level.</li>
          <li>Inspect available tables and columns in the schema explorer.</li>
          <li>Write a read-only SELECT query in the SQL editor.</li>
          <li>
            Run the query with the Run Query button, or press ⌘Enter / Ctrl+Enter.
          </li>
          <li>Use the success clue to unlock the next level and continue the case.</li>
        </ol>

        <p className="instructions-modal__note">
          Only SELECT queries are allowed. INSERT, UPDATE, DELETE, and other write
          statements are blocked. Your progress and SQL drafts are saved in this
          browser.
        </p>

        <PrimaryButton onClick={onClose}>Back to the case</PrimaryButton>
      </div>
    </div>
  )
}

export default InstructionsModal
