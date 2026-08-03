import type { ColumnInfo, TableSummary } from '../api/types'
import './SchemaExplorer.css'

type SchemaExplorerProps = {
  tables: TableSummary[]
  selectedTable: string | null
  columns: ColumnInfo[]
  isLoadingColumns?: boolean
  onSelectTable: (tableName: string) => void
}

function SchemaExplorer({
  tables,
  selectedTable,
  columns,
  isLoadingColumns = false,
  onSelectTable,
}: SchemaExplorerProps) {
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
                  <span className="schema-explorer__column-name">{column.name}</span>
                  <span className="schema-explorer__column-type">{column.dataType}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="schema-explorer__empty">Select a table to inspect its columns.</p>
      )}
    </section>
  )
}

export default SchemaExplorer
