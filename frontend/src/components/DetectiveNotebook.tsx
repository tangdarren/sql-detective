import type { PinnedEvidence } from '../lib/notebookStorage'
import './DetectiveNotebook.css'

type DetectiveNotebookProps = {
  caseId: string
  notes: string
  pinnedEvidence: PinnedEvidence[]
  onNotesChange: (notes: string) => void
  onClear: () => void
}

function formatPinnedRow(row: PinnedEvidence): string {
  return row.columns
    .map((column, index) => `${column}=${row.values[index] ?? ''}`)
    .join(' · ')
}

function DetectiveNotebook({
  caseId,
  notes,
  pinnedEvidence,
  onNotesChange,
  onClear,
}: DetectiveNotebookProps) {
  function handleClear() {
    const confirmed = window.confirm(
      'Clear investigation notes and pinned evidence for this case?',
    )
    if (!confirmed) {
      return
    }
    onClear()
  }

  return (
    <section className="detective-notebook" aria-labelledby="detective-notebook-title">
      <div className="detective-notebook__header">
        <h2 id="detective-notebook-title" className="detective-notebook__title">
          Detective Notebook
        </h2>
        <button type="button" className="detective-notebook__clear" onClick={handleClear}>
          Clear Notes
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

      <div className="detective-notebook__evidence">
        <h3 className="detective-notebook__evidence-title">Pinned Evidence</h3>
        {pinnedEvidence.length === 0 ? (
          <p className="detective-notebook__evidence-empty">
            Pin rows from Query Results to keep them here.
          </p>
        ) : (
          <ul className="detective-notebook__evidence-list">
            {pinnedEvidence.map((row) => (
              <li key={row.id} className="detective-notebook__evidence-item">
                <span className="detective-notebook__evidence-level">Level {row.levelNumber}</span>
                <span className="detective-notebook__evidence-values">{formatPinnedRow(row)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default DetectiveNotebook
