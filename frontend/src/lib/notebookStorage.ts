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

export type PinEvidenceInput = {
  levelNumber: number
  columns: string[]
  values: string[]
}

function notebookKey(caseId: string): string {
  return `sql-detective:${caseId}:notebook`
}

function emptyNotebook(): NotebookData {
  return { notes: '', pinnedEvidence: [] }
}

function asDisplayString(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  return String(value)
}

function coercePinnedEvidence(value: unknown): PinnedEvidence | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const row = value as Record<string, unknown>
  const levelNumber = row.levelNumber
  if (typeof levelNumber !== 'number' || !Number.isInteger(levelNumber) || levelNumber < 1) {
    return null
  }
  if (!Array.isArray(row.columns) || !Array.isArray(row.values)) {
    return null
  }

  const columns = row.columns.map((column) => asDisplayString(column))
  const values = row.values.map((cell) => asDisplayString(cell))
  const id =
    typeof row.id === 'string' && row.id.length > 0
      ? row.id
      : buildPinnedEvidenceId(levelNumber, columns, values)

  return { id, levelNumber, columns, values }
}

function normalizeNotebookData(value: unknown): NotebookData | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }

  const data = value as Record<string, unknown>
  const looksLikeNotebook = 'notes' in data || 'pinnedEvidence' in data
  if (!looksLikeNotebook) {
    return null
  }

  const notes = typeof data.notes === 'string' ? data.notes : ''
  const pinnedEvidence = Array.isArray(data.pinnedEvidence)
    ? data.pinnedEvidence
        .map(coercePinnedEvidence)
        .filter((row): row is PinnedEvidence => row !== null)
        .slice(0, MAX_PINNED_EVIDENCE)
    : []

  return { notes, pinnedEvidence }
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
      return emptyNotebook()
    }

    try {
      const parsed: unknown = JSON.parse(raw)
      const normalized = normalizeNotebookData(parsed)
      if (normalized) {
        return normalized
      }
      if (typeof parsed === 'string') {
        return { notes: parsed, pinnedEvidence: [] }
      }
      // Parsed JSON that is not notebook-shaped (array, number, unrelated object).
      return emptyNotebook()
    } catch {
      // Previous versions stored plain-text notes.
      return { notes: raw, pinnedEvidence: [] }
    }
  } catch {
    return emptyNotebook()
  }
}

export function saveNotebookData(caseId: string, data: NotebookData): NotebookData {
  const next: NotebookData = {
    notes: typeof data.notes === 'string' ? data.notes : '',
    pinnedEvidence: data.pinnedEvidence
      .map(coercePinnedEvidence)
      .filter((row): row is PinnedEvidence => row !== null)
      .slice(0, MAX_PINNED_EVIDENCE),
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

export function pinEvidence(caseId: string, input: PinEvidenceInput): PinEvidenceResult {
  const current = getNotebookData(caseId)
  const columns = input.columns.map((column) => asDisplayString(column))
  const values = input.values.map((cell) => asDisplayString(cell))
  const levelNumber = input.levelNumber
  const id = buildPinnedEvidenceId(levelNumber, columns, values)

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
        levelNumber,
        columns,
        values,
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
