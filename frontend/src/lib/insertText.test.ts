import { describe, expect, it } from 'vitest'
import { insertSqlIdentifier, insertTextAtSelection } from './insertText'

describe('insertTextAtSelection', () => {
  it('inserts at the cursor when nothing is selected', () => {
    expect(insertTextAtSelection('SELECT  FROM guests', 7, 7, '*')).toEqual({
      value: 'SELECT * FROM guests',
      selectionStart: 8,
      selectionEnd: 8,
    })
  })

  it('replaces the selected range', () => {
    expect(insertTextAtSelection('SELECT name FROM guests', 7, 11, 'id')).toEqual({
      value: 'SELECT id FROM guests',
      selectionStart: 9,
      selectionEnd: 9,
    })
  })

  it('appends when the cursor is at the end', () => {
    expect(insertTextAtSelection('SELECT', 6, 6, ' id')).toEqual({
      value: 'SELECT id',
      selectionStart: 9,
      selectionEnd: 9,
    })
  })

  it('clamps out-of-range selection indexes', () => {
    expect(insertTextAtSelection('abc', -3, 99, 'X')).toEqual({
      value: 'X',
      selectionStart: 1,
      selectionEnd: 1,
    })
  })

  it('normalizes a reversed selection', () => {
    expect(insertTextAtSelection('abcdef', 4, 2, 'Z')).toEqual({
      value: 'abZef',
      selectionStart: 3,
      selectionEnd: 3,
    })
  })
})

describe('insertSqlIdentifier', () => {
  it('inserts a table name into empty editor text', () => {
    expect(insertSqlIdentifier('', 0, 0, 'guests')).toEqual({
      value: 'guests',
      selectionStart: 6,
      selectionEnd: 6,
    })
  })

  it('adds a leading space when jammed against an identifier', () => {
    expect(insertSqlIdentifier('FROM', 4, 4, 'guests')).toEqual({
      value: 'FROM guests',
      selectionStart: 11,
      selectionEnd: 11,
    })
  })

  it('adds a trailing space when the next character is an identifier', () => {
    expect(insertSqlIdentifier('SELECTFROM guests', 6, 6, 'id')).toEqual({
      value: 'SELECT id FROM guests',
      selectionStart: 10,
      selectionEnd: 10,
    })
  })

  it('adds a space after a comma but not after an open parenthesis', () => {
    expect(insertSqlIdentifier('SELECT (', 8, 8, 'id')).toEqual({
      value: 'SELECT (id',
      selectionStart: 10,
      selectionEnd: 10,
    })
    expect(insertSqlIdentifier('SELECT id,', 10, 10, 'room_number')).toEqual({
      value: 'SELECT id, room_number',
      selectionStart: 22,
      selectionEnd: 22,
    })
  })

  it('trims the identifier and ignores blank inserts', () => {
    expect(insertSqlIdentifier('SELECT', 6, 6, '  full_name  ')).toEqual({
      value: 'SELECT full_name',
      selectionStart: 16,
      selectionEnd: 16,
    })
    expect(insertSqlIdentifier('SELECT', 6, 6, '   ')).toEqual({
      value: 'SELECT',
      selectionStart: 6,
      selectionEnd: 6,
    })
  })

  it('replaces a selected identifier without duplicating spaces', () => {
    expect(insertSqlIdentifier('SELECT name FROM guests', 7, 11, 'id')).toEqual({
      value: 'SELECT id FROM guests',
      selectionStart: 9,
      selectionEnd: 9,
    })
  })
})
