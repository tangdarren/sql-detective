import type {
  CaseSummary,
  ChallengeDetail,
  ChallengeSummary,
  QueryExecutionResult,
  TableDetails,
  TableSummary,
} from '../api/types'

export const mockCase: CaseSummary = {
  caseId: 'blackwood',
  title: 'Case 01: The Blackwood Hotel',
  subtitle: 'The Missing Portrait',
  synopsis: 'A valuable painting disappeared from Room 417.',
  setting: 'Blackwood Hotel',
  eventDate: '2024-11-03',
  challengeCount: 2,
}

export const mockChallengeSummaries: ChallengeSummary[] = [
  { levelNumber: 1, title: 'The Guest Registry', difficulty: 'EASY' },
  { levelNumber: 2, title: 'The Missing Master Key', difficulty: 'MEDIUM' },
]

export const mockChallengeDetails: Record<number, ChallengeDetail> = {
  1: {
    levelNumber: 1,
    title: 'The Guest Registry',
    storyText: 'Start with the guest registry for the private reception.',
    objective: 'List fourth-floor guests from the event night.',
    starterQuery: 'SELECT full_name, room_number, vip_status\nFROM guests;',
    hint: 'Filter rooms 410 to 422 and order by room number.',
    difficulty: 'EASY',
    orderSensitive: true,
  },
  2: {
    levelNumber: 2,
    title: 'The Missing Master Key',
    storyText: 'A master key was signed out during the night shift.',
    objective: 'Find master-key employees active that night.',
    starterQuery: 'SELECT e.full_name, e.job_title\nFROM employees e;',
    hint: 'Join employees to room access logs.',
    difficulty: 'MEDIUM',
    orderSensitive: false,
  },
}

export const mockTables: TableSummary[] = [
  { name: 'guests', description: 'Registered hotel guests and room assignments.' },
  { name: 'employees', description: 'Hotel staff schedules and access levels.' },
]

export const mockTableDetails: TableDetails = {
  name: 'guests',
  description: 'Registered hotel guests and room assignments.',
  columns: [
    { name: 'id', dataType: 'integer', nullable: false, defaultValue: null },
    { name: 'full_name', dataType: 'text', nullable: false, defaultValue: null },
    { name: 'room_number', dataType: 'integer', nullable: false, defaultValue: null },
  ],
}

export const correctExecution: QueryExecutionResult = {
  columns: ['full_name', 'room_number', 'vip_status'],
  rows: [
    ['Julian Pike', 410, true],
    ['Marcus Hale', 412, false],
  ],
  rowCount: 2,
  executionTimeMs: 12,
  correct: true,
  feedback: 'Several guests stayed on the fourth floor near Room 417 that night.',
}

export const incorrectExecution: QueryExecutionResult = {
  columns: ['full_name'],
  rows: [['Julian Pike']],
  rowCount: 1,
  executionTimeMs: 8,
  correct: false,
  feedback: 'Check which columns the objective requests.',
}

export const syntaxErrorExecution: QueryExecutionResult = {
  columns: [],
  rows: [],
  rowCount: 0,
  executionTimeMs: 1,
  correct: false,
  feedback: 'Your SQL contains a syntax error near JOIN.',
  errorType: 'SYNTAX_ERROR',
}

export const forbiddenExecution: QueryExecutionResult = {
  columns: [],
  rows: [],
  rowCount: 0,
  executionTimeMs: 1,
  correct: false,
  feedback: 'Only read-only SELECT queries are allowed.',
  errorType: 'FORBIDDEN_STATEMENT',
}
