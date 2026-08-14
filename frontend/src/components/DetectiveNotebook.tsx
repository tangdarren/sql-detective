import { useId, useState } from 'react'
import { MAX_PINNED_EVIDENCE, type PinnedEvidence } from '../lib/notebookStorage'
import './DetectiveNotebook.css'

const NARROW_SCREEN_QUERY = '(max-width: 960px)'

type DetectiveNotebookProps = {
  caseId: string
  notes: string
  pinnedEvidence: PinnedEvidence[]
  onNotesChange: (notes: string) => void
  onRemoveClipping: (evidenceId: string) => void
  onClearNotebook: () => void
}

function displayValue(value: string | undefined): string {
  return value ?? 'NULL'
}

function getDefaultOpen(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true
  }
  return !window.matchMedia(NARROW_SCREEN_QUERY).matches
}

function DetectiveNotebook({
  caseId,
  notes,
  pinnedEvidence,
  onNotesChange,
  onRemoveClipping,
  onClearNotebook,
}: DetectiveNotebookProps) {
  const [isOpen, setIsOpen] = useState(getDefaultOpen)
  const panelId = useId()
  const notesId = `detective-notebook-notes-${caseId}`

  function handleClearNotebook() {
    const confirmed = window.confirm(
      'Clear the Detective Notebook? This removes written notes and all evidence clippings.',
    )
    if (!confirmed) {
      return
    }
    onClearNotebook()
  }

  return (
    <section
      className={
        isOpen ? 'detective-notebook' : 'detective-notebook detective-notebook--collapsed'
      }
      aria-labelledby="detective-notebook-title"
    >
      <div className="detective-notebook__header">
        <h2 id="detective-notebook-title" className="detective-notebook__title">
          Detective Notebook
        </h2>
        <div className="detective-notebook__header-actions">
          {!isOpen ? (
            <span className="detective-notebook__clippings-count detective-notebook__clippings-count--header">
              {pinnedEvidence.length} / {MAX_PINNED_EVIDENCE} clippings
            </span>
          ) : null}
          <button
            type="button"
            className="detective-notebook__toggle"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={isOpen ? 'Close Detective Notebook' : 'Open Detective Notebook'}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? 'Close Notebook' : 'Open Notebook'}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div id={panelId} className="detective-notebook__panel">
          <div className="detective-notebook__toolbar">
            <button
              type="button"
              className="detective-notebook__clear"
              aria-label="Clear notebook notes and evidence clippings"
              onClick={handleClearNotebook}
            >
              Clear Notebook
            </button>
          </div>

          <label className="detective-notebook__label" htmlFor={notesId}>
            Investigation notes
          </label>
          <textarea
            id={notesId}
            className="detective-notebook__input"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={4}
            spellCheck={true}
            aria-label="Investigation notes"
            placeholder="Jot down leads, suspicions, and open questions…"
          />

          <div className="detective-notebook__clippings">
            <div className="detective-notebook__clippings-header">
              <h3 className="detective-notebook__clippings-title">Evidence Clippings</h3>
              <p className="detective-notebook__clippings-count" aria-live="polite">
                {pinnedEvidence.length} / {MAX_PINNED_EVIDENCE} clippings
              </p>
            </div>

            {pinnedEvidence.length === 0 ? (
              <p className="detective-notebook__clippings-empty">
                Pin rows from Query Results to file them here.
              </p>
            ) : (
              <ul className="detective-notebook__clipping-list">
                {pinnedEvidence.map((row, clippingIndex) => (
                  <li key={row.id} className="detective-notebook__clipping">
                    <div className="detective-notebook__clipping-header">
                      <span className="detective-notebook__clipping-level">
                        Discovered · Level {row.levelNumber}
                      </span>
                      <button
                        type="button"
                        className="detective-notebook__clipping-remove"
                        aria-label={`Remove evidence clipping ${clippingIndex + 1} from level ${row.levelNumber}`}
                        onClick={() => onRemoveClipping(row.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <dl className="detective-notebook__clipping-fields">
                      {row.columns.map((column, index) => (
                        <div
                          key={`${row.id}-${column}-${index}`}
                          className="detective-notebook__clipping-field"
                        >
                          <dt className="detective-notebook__clipping-column">{column}</dt>
                          <dd className="detective-notebook__clipping-value">
                            {displayValue(row.values[index])}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div id={panelId} hidden className="detective-notebook__panel" />
      )}
    </section>
  )
}

export default DetectiveNotebook
