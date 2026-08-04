import { useEffect, useRef, useState } from 'react'
import './QueryResults.css'

export type PinRowPayload = {
  levelNumber: number
  columns: string[]
  values: string[]
}

type QueryResultsProps = {
  columns: string[]
  rows: unknown[][]
  rowCount?: number
  executionTimeMs?: number | null
  emptyMessage?: string
  isProcessing?: boolean
  levelNumber?: number
  onPinRow?: (payload: PinRowPayload) => boolean
  pinMessage?: string | null
}

const FILED_FEEDBACK_MS = 1800

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
  levelNumber,
  onPinRow,
  pinMessage = null,
}: QueryResultsProps) {
  const displayCount = rowCount ?? rows.length
  const canPin = typeof levelNumber === 'number' && typeof onPinRow === 'function'
  const [filedRows, setFiledRows] = useState<Set<number>>(() => new Set())
  const filedTimers = useRef<Map<number, number>>(new Map())

  useEffect(() => {
    setFiledRows(new Set())
    for (const timerId of filedTimers.current.values()) {
      window.clearTimeout(timerId)
    }
    filedTimers.current.clear()
  }, [columns, rows])

  useEffect(() => {
    return () => {
      for (const timerId of filedTimers.current.values()) {
        window.clearTimeout(timerId)
      }
      filedTimers.current.clear()
    }
  }, [])

  function markFiled(rowIndex: number) {
    setFiledRows((current) => {
      const next = new Set(current)
      next.add(rowIndex)
      return next
    })

    const existing = filedTimers.current.get(rowIndex)
    if (existing != null) {
      window.clearTimeout(existing)
    }

    const timerId = window.setTimeout(() => {
      setFiledRows((current) => {
        const next = new Set(current)
        next.delete(rowIndex)
        return next
      })
      filedTimers.current.delete(rowIndex)
    }, FILED_FEEDBACK_MS)

    filedTimers.current.set(rowIndex, timerId)
  }

  function handlePin(row: unknown[], rowIndex: number) {
    if (!canPin) {
      return
    }
    const pinned = onPinRow({
      levelNumber,
      columns: [...columns],
      values: row.map((cell) => formatCell(cell)),
    })
    if (pinned) {
      markFiled(rowIndex)
    }
  }

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
                {canPin ? (
                  <th scope="col" className="query-results__pin-col">
                    Pin
                  </th>
                ) : null}
                {columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const isFiled = filedRows.has(rowIndex)
                return (
                  <tr key={`row-${rowIndex}`}>
                    {canPin ? (
                      <td className="query-results__pin-col">
                        <button
                          type="button"
                          className={
                            isFiled
                              ? 'query-results__pin query-results__pin--filed'
                              : 'query-results__pin'
                          }
                          aria-label={
                            isFiled
                              ? `Row ${rowIndex + 1} filed in notebook`
                              : `Pin row ${rowIndex + 1} as notebook evidence`
                          }
                          disabled={isFiled}
                          onClick={() => handlePin(row, rowIndex)}
                        >
                          {isFiled ? 'Filed' : 'Pin'}
                        </button>
                      </td>
                    ) : null}
                    {columns.map((column, columnIndex) => (
                      <td key={`${rowIndex}-${column}`}>{formatCell(row[columnIndex])}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {pinMessage ? (
        <p className="query-results__pin-message" role="status">
          {pinMessage}
        </p>
      ) : null}
    </section>
  )
}

export default QueryResults
