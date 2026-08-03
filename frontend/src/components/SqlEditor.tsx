import './SqlEditor.css'

type SqlEditorProps = {
  value: string
  onChange: (value: string) => void
  onRun: () => void
}

function SqlEditor({ value, onChange, onRun }: SqlEditorProps) {
  return (
    <section className="sql-editor" aria-labelledby="sql-editor-title">
      <div className="sql-editor__header">
        <h2 id="sql-editor-title" className="sql-editor__title">
          SQL Editor
        </h2>
        <button type="button" className="sql-editor__run" onClick={onRun}>
          Run Query
        </button>
      </div>
      <label className="sql-editor__label" htmlFor="sql-editor-input">
        Query
      </label>
      <textarea
        id="sql-editor-input"
        className="sql-editor__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        rows={8}
      />
    </section>
  )
}

export default SqlEditor
