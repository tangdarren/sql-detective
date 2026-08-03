import './QueryResults.css'

type QueryResultsProps = {
  columns: string[]
  rows: unknown[][]
  rowCount?: number
  executionTimeMs?: number | null
  emptyMessage?: string
  isProcessing?: boolean
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  return String(value)
}

function QueryResults({
  columns,
  rows,
  rowCount,
  executionTimeMs,
  emptyMessage = 'No results yet. Run a query to inspect the evidence.',
  isProcessing = false,
}: QueryResultsProps) {
  const displayCount = rowCount ?? rows.length

  return (
    <section className="query-results" aria-labelledby="query-results-title">
      <div className="query-results__header">
        <h2 id="query-results-title" className="query-results__title">
          Query Results
        </h2>
        <div className="query-results__meta">
          {isProcessing ? <span>Processing query…</span> : null}
          {!isProcessing && executionTimeMs != null ? (
            <span>{executionTimeMs} ms</span>
          ) : null}
          {!isProcessing && rows.length > 0 ? <span>{displayCount} row(s)</span> : null}
        </div>
      </div>

      {isProcessing ? (
        <p className="query-results__empty">Running your query against the hotel records…</p>
      ) : null}

      {!isProcessing && rows.length === 0 ? (
        <p className="query-results__empty">{emptyMessage}</p>
      ) : null}

      {!isProcessing && rows.length > 0 ? (
        <div className="query-results__table-wrap">
          <table className="query-results__table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {columns.map((column, columnIndex) => (
                    <td key={`${rowIndex}-${column}`}>{formatCell(row[columnIndex])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}

export default QueryResults
