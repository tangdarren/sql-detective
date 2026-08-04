import { useState } from 'react'
import {
  clearNotebookNotes,
  getNotebookNotes,
  saveNotebookNotes,
} from '../lib/notebookStorage'
import './DetectiveNotebook.css'

type DetectiveNotebookProps = {
  caseId: string
}

function DetectiveNotebook({ caseId }: DetectiveNotebookProps) {
  const [notes, setNotes] = useState(() => getNotebookNotes(caseId))

  function handleChange(value: string) {
    setNotes(value)
    saveNotebookNotes(caseId, value)
  }

  function handleClear() {
    const confirmed = window.confirm('Clear investigation notes for this case?')
    if (!confirmed) {
      return
    }
    clearNotebookNotes(caseId)
    setNotes('')
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
        onChange={(event) => handleChange(event.target.value)}
        rows={5}
        spellCheck={true}
        aria-label="Investigation notes"
        placeholder="Jot down leads, suspicions, and open questions…"
      />
    </section>
  )
}

export default DetectiveNotebook
