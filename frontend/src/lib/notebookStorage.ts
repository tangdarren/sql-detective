/** Case 01 storage id — keep case-scoped so later cases can use their own keys. */
export const CASE_01_ID = 'case-01'

function notebookKey(caseId: string): string {
  return `sql-detective:${caseId}:notebook`
}

export function getNotebookNotes(caseId: string): string {
  try {
    return localStorage.getItem(notebookKey(caseId)) ?? ''
  } catch {
    return ''
  }
}

export function saveNotebookNotes(caseId: string, notes: string): void {
  try {
    localStorage.setItem(notebookKey(caseId), notes)
  } catch {
    // Ignore quota / privacy-mode failures; notes remain in memory for the session.
  }
}

export function clearNotebookNotes(caseId: string): void {
  try {
    localStorage.removeItem(notebookKey(caseId))
  } catch {
    // Ignore storage failures.
  }
}
