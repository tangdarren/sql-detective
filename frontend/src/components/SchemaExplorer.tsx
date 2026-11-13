import type { ColumnInfo, TableSummary } from '../api/types'
import './SchemaExplorer.css'

type SchemaExplorerProps = {
  tables: TableSummary[]
  selectedTable: string | null
  columns: ColumnInfo[]
  isLoadingColumns?: boolean
  onSelectTable: (tableName: string) => void
  onInsertIdentifier?: (identifier: string) => void
}

function SchemaExplorer({
  tables,
  selectedTable,
  columns,
  isLoadingColumns = false,
  onSelectTable,
  onInsertIdentifier,
}: SchemaExplorerProps) {
  const canInsert = typeof onInsertIdentifier === 'function'

  return (
    <section className="schema-explorer" aria-labelledby="schema-explorer-title">
      <h2 id="schema-explorer-title" className="schema-explorer__title">
        Schema Explorer
      </h2>

      {tables.length === 0 ? (
        <p className="schema-explorer__empty">No tables available.</p>
      ) : (
        <ul className="schema-explorer__tables">
          {tables.map((table) => (
            <li key={table.name}>
              <button
                type="button"
                className={
                  selectedTable === table.name
                    ? 'schema-explorer__table schema-explorer__table--active'
                    : 'schema-explorer__table'
                }
                onClick={() => onSelectTable(table.name)}
                onDoubleClick={() => {
                  if (canInsert) {
                    onInsertIdentifier(table.name)
                  }
                }}
                aria-label={
                  canInsert
                    ? `${table.name}. Double-click to insert into query`
                    : table.name
                }
              >
                {table.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedTable ? (
        <div className="schema-explorer__columns">
          <h3 className="schema-explorer__columns-title">{selectedTable} columns</h3>
          {isLoadingColumns ? (
            <p className="schema-explorer__empty">Loading columns…</p>
          ) : (
            <ul className="schema-explorer__column-list">
              {columns.map((column) => (
                <li key={column.name}>
                  {canInsert ? (
                    <button
                      type="button"
                      className="schema-explorer__column"
                      onClick={() => onInsertIdentifier(column.name)}
                      aria-label={`Insert ${column.name} into query`}
                    >
                      <span className="schema-explorer__column-name">{column.name}</span>
                      <span className="schema-explorer__column-type">{column.dataType}</span>
                    </button>
                  ) : (
                    <>
                      <span className="schema-explorer__column-name">{column.name}</span>
                      <span className="schema-explorer__column-type">{column.dataType}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="schema-explorer__empty">Select a table to inspect its columns.</p>
      )}

      {canInsert ? (
        <p className="schema-explorer__hint" id="schema-explorer-insert-hint">
          Click a column to insert it. Double-click a table name to insert it.
        </p>
      ) : null}
    </section>
  )
}

export default SchemaExplorer
