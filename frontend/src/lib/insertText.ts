export type TextInsertion = {
  value: string
  selectionStart: number
  selectionEnd: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function normalizeSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): { start: number; end: number } {
  const start = clamp(selectionStart, 0, value.length)
  const end = clamp(selectionEnd, 0, value.length)
  return start <= end ? { start, end } : { start: end, end: start }
}

function needsLeadingSpace(charBefore: string | undefined): boolean {
  if (charBefore == null || charBefore.length === 0) {
    return false
  }
  // Pad after identifiers and commas so "id," + "room" becomes "id, room".
  return /[A-Za-z0-9_,]/.test(charBefore)
}

function needsTrailingSpace(charAfter: string | undefined): boolean {
  if (charAfter == null || charAfter.length === 0) {
    return false
  }
  return /[A-Za-z0-9_]/.test(charAfter)
}

/**
 * Inserts `text` at the current selection, replacing any selected range.
 * Cursor is placed immediately after the inserted text.
 */
export function insertTextAtSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  text: string,
): TextInsertion {
  const { start, end } = normalizeSelection(value, selectionStart, selectionEnd)
  const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`
  const cursor = start + text.length
  return {
    value: nextValue,
    selectionStart: cursor,
    selectionEnd: cursor,
  }
}

/**
 * Inserts a SQL identifier (table or column name), adding a space when it
 * would otherwise sit flush against another identifier character.
 */
export function insertSqlIdentifier(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  identifier: string,
): TextInsertion {
  const trimmed = identifier.trim()
  if (!trimmed) {
    const { start, end } = normalizeSelection(value, selectionStart, selectionEnd)
    return {
      value,
      selectionStart: start,
      selectionEnd: end,
    }
  }

  const { start, end } = normalizeSelection(value, selectionStart, selectionEnd)
  const before = value.slice(0, start)
  const after = value.slice(end)

  const leading = needsLeadingSpace(before.at(-1)) ? ' ' : ''
  const trailing = needsTrailingSpace(after.at(0)) ? ' ' : ''
  const text = `${leading}${trimmed}${trailing}`

  return insertTextAtSelection(value, start, end, text)
}
