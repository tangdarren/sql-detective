import type { QueryResultRow } from '../data/placeholderChallenge'
import './QueryResults.css'

type QueryResultsProps = {
  rows: QueryResultRow[]
  emptyMessage?: string
}

function QueryResults({ rows, emptyMessage = 'No results yet. Run a query to inspect the evidence.' }: QueryResultsProps) {
  if (rows.length === 0) {
    return (
      <section className="query-results" aria-labelledby="query-results-title">
        <h2 id="query-results-title" className="query-results__title">
          Query Results
        </h2>
        <p className="query-results__empty">{emptyMessage}</p>
      </section>
    )
  }

  const columns = Object.keys(rows[0])

  return (
    <section className="query-results" aria-labelledby="query-results-title">
      <h2 id="query-results-title" className="query-results__title">
        Query Results
      </h2>
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
              <tr key={`${rowIndex}-${String(row[columns[0]])}`}>
                {columns.map((column) => (
                  <td key={column}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default QueryResults
