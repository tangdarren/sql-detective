/** Case 01 storage id — keep case-scoped so later cases can use their own keys. */
export const CASE_01_ID = 'case-01'

export const MAX_PINNED_EVIDENCE = 12

export type PinnedEvidence = {
  id: string
  levelNumber: number
  columns: string[]
  values: string[]
}

export type NotebookData = {
  notes: string
  pinnedEvidence: PinnedEvidence[]
}

export type PinEvidenceResult =
  | { ok: true; data: NotebookData }
  | { ok: false; reason: 'duplicate' | 'limit'; data: NotebookData }

const EMPTY_NOTEBOOK: NotebookData = {
  notes: '',
  pinnedEvidence: [],
}

function notebookKey(caseId: string): string {
  return `sql-detective:${caseId}:notebook`
}

function isPinnedEvidence(value: unknown): value is PinnedEvidence {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const row = value as Partial<PinnedEvidence>
  return (
    typeof row.id === 'string' &&
    typeof row.levelNumber === 'number' &&
    Array.isArray(row.columns) &&
    Array.isArray(row.values) &&
    row.columns.every((column) => typeof column === 'string') &&
    row.values.every((cell) => typeof cell === 'string')
  )
}

function normalizeNotebookData(value: unknown): NotebookData | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }
  const data = value as Partial<NotebookData>
  if (typeof data.notes !== 'string') {
    return null
  }
  const pinned = Array.isArray(data.pinnedEvidence)
    ? data.pinnedEvidence.filter(isPinnedEvidence)
    : []
  return {
    notes: data.notes,
    pinnedEvidence: pinned,
  }
}

function writeNotebookData(caseId: string, data: NotebookData): void {
  try {
    localStorage.setItem(notebookKey(caseId), JSON.stringify(data))
  } catch {
    // Ignore quota / privacy-mode failures; data remains in memory for the session.
  }
}

export function buildPinnedEvidenceId(
  levelNumber: number,
  columns: string[],
  values: string[],
): string {
  return [String(levelNumber), columns.join('\u001f'), values.join('\u001f')].join('\u001e')
}

export function getNotebookData(caseId: string): NotebookData {
  try {
    const raw = localStorage.getItem(notebookKey(caseId))
    if (!raw) {
      return { ...EMPTY_NOTEBOOK, pinnedEvidence: [] }
    }

    try {
      const parsed: unknown = JSON.parse(raw)
      const normalized = normalizeNotebookData(parsed)
      if (normalized) {
        return normalized
      }
    } catch {
      // Previous versions stored plain-text notes.
    }

    return {
      notes: raw,
      pinnedEvidence: [],
    }
  } catch {
    return { ...EMPTY_NOTEBOOK, pinnedEvidence: [] }
  }
}

export function saveNotebookData(caseId: string, data: NotebookData): NotebookData {
  const next: NotebookData = {
    notes: data.notes,
    pinnedEvidence: data.pinnedEvidence.filter(isPinnedEvidence).slice(0, MAX_PINNED_EVIDENCE),
  }
  writeNotebookData(caseId, next)
  return next
}

export function getNotebookNotes(caseId: string): string {
  return getNotebookData(caseId).notes
}

export function saveNotebookNotes(caseId: string, notes: string): NotebookData {
  const current = getNotebookData(caseId)
  return saveNotebookData(caseId, { ...current, notes })
}

export function getPinnedEvidence(caseId: string): PinnedEvidence[] {
  return getNotebookData(caseId).pinnedEvidence
}

export function pinEvidence(
  caseId: string,
  input: { levelNumber: number; columns: string[]; values: string[] },
): PinEvidenceResult {
  const current = getNotebookData(caseId)
  const id = buildPinnedEvidenceId(input.levelNumber, input.columns, input.values)

  if (current.pinnedEvidence.some((row) => row.id === id)) {
    return { ok: false, reason: 'duplicate', data: current }
  }

  if (current.pinnedEvidence.length >= MAX_PINNED_EVIDENCE) {
    return { ok: false, reason: 'limit', data: current }
  }

  const next = saveNotebookData(caseId, {
    ...current,
    pinnedEvidence: [
      ...current.pinnedEvidence,
      {
        id,
        levelNumber: input.levelNumber,
        columns: [...input.columns],
        values: [...input.values],
      },
    ],
  })

  return { ok: true, data: next }
}

export function removePinnedEvidence(caseId: string, evidenceId: string): NotebookData {
  const current = getNotebookData(caseId)
  return saveNotebookData(caseId, {
    ...current,
    pinnedEvidence: current.pinnedEvidence.filter((row) => row.id !== evidenceId),
  })
}

/** Clears written notes and evidence clippings for a case. */
export function clearNotebook(caseId: string): void {
  try {
    localStorage.removeItem(notebookKey(caseId))
  } catch {
    // Ignore storage failures.
  }
}

export function clearNotebookNotes(caseId: string): void {
  clearNotebook(caseId)
}
