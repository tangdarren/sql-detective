import './QueryHistory.css'

type QueryHistoryProps = {
  queries: string[]
  onSelect: (query: string) => void
  onClear: () => void
}

function shortenQueryPreview(query: string, maxLength = 72): string {
  const compact = query.replace(/\s+/g, ' ').trim()
  if (compact.length <= maxLength) {
    return compact
  }
  return `${compact.slice(0, maxLength - 1)}…`
}

function QueryHistory({ queries, onSelect, onClear }: QueryHistoryProps) {
  return (
    <section className="query-history" aria-labelledby="query-history-title">
      <div className="query-history__header">
        <h2 id="query-history-title" className="query-history__title">
          Query History
        </h2>
        <button
          type="button"
          className="query-history__clear"
          onClick={onClear}
          disabled={queries.length === 0}
          aria-label="Clear query history for this level"
        >
          Clear History
        </button>
      </div>

      {queries.length === 0 ? (
        <p className="query-history__empty">No recent queries for this level.</p>
      ) : (
        <ul className="query-history__list">
          {queries.map((query, index) => (
            <li key={`${index}-${query}`}>
              <button
                type="button"
                className="query-history__item"
                onClick={() => onSelect(query)}
                aria-label={`Restore query: ${shortenQueryPreview(query, 48)}`}
              >
                <span className="query-history__preview">{shortenQueryPreview(query)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default QueryHistory
