import { MAX_PINNED_EVIDENCE, type PinnedEvidence } from '../lib/notebookStorage'
import './DetectiveNotebook.css'

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

function DetectiveNotebook({
  caseId,
  notes,
  pinnedEvidence,
  onNotesChange,
  onRemoveClipping,
  onClearNotebook,
}: DetectiveNotebookProps) {
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
    <section className="detective-notebook" aria-labelledby="detective-notebook-title">
      <div className="detective-notebook__header">
        <h2 id="detective-notebook-title" className="detective-notebook__title">
          Detective Notebook
        </h2>
        <button
          type="button"
          className="detective-notebook__clear"
          onClick={handleClearNotebook}
        >
          Clear Notebook
        </button>
      </div>
      <label className="detective-notebook__label" htmlFor={`detective-notebook-${caseId}`}>
        Investigation notes
      </label>
      <textarea
        id={`detective-notebook-${caseId}`}
        className="detective-notebook__input"
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        rows={5}
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
            {pinnedEvidence.map((row) => (
              <li key={row.id} className="detective-notebook__clipping">
                <div className="detective-notebook__clipping-header">
                  <span className="detective-notebook__clipping-level">
                    Discovered · Level {row.levelNumber}
                  </span>
                  <button
                    type="button"
                    className="detective-notebook__clipping-remove"
                    onClick={() => onRemoveClipping(row.id)}
                  >
                    Remove
                  </button>
                </div>
                <dl className="detective-notebook__clipping-fields">
                  {row.columns.map((column, index) => (
                    <div key={`${row.id}-${column}-${index}`} className="detective-notebook__clipping-field">
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
    </section>
  )
}

export default DetectiveNotebook
