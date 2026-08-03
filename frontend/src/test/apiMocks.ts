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
  challengeCount: 5,
}

export const mockChallengeSummaries: ChallengeSummary[] = [
  { levelNumber: 1, title: 'The Guest Registry', difficulty: 'EASY' },
  { levelNumber: 2, title: 'The Missing Master Key', difficulty: 'MEDIUM' },
  { levelNumber: 3, title: 'Midnight Entry', difficulty: 'MEDIUM' },
  { levelNumber: 4, title: 'Suspicious Payments', difficulty: 'MEDIUM' },
  { levelNumber: 5, title: 'Identify the Thief', difficulty: 'HARD' },
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
    evidenceImageFilename: 'guest-registry.svg',
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
    evidenceImageFilename: 'master-key.svg',
  },
  3: {
    levelNumber: 3,
    title: 'Midnight Entry',
    storyText: 'Door logs after midnight may matter most.',
    objective: 'Find Room 417 access after midnight.',
    starterQuery: 'SELECT room_number, person_type, person_id, entry_time\nFROM room_access_logs;',
    hint: 'Use BETWEEN on entry_time.',
    difficulty: 'MEDIUM',
    orderSensitive: false,
    evidenceImageFilename: 'midnight-entry.svg',
  },
  4: {
    levelNumber: 4,
    title: 'Suspicious Payments',
    storyText: 'Cash moved through the lobby after the reception.',
    objective: 'Find guests with unusual cash totals.',
    starterQuery: 'SELECT g.full_name, COUNT(*) AS payment_count\nFROM payments p\nINNER JOIN guests g ON g.id = p.guest_id;',
    hint: 'GROUP BY and HAVING on the summed amount.',
    difficulty: 'MEDIUM',
    orderSensitive: false,
    evidenceImageFilename: 'suspicious-payments.svg',
  },
  5: {
    levelNumber: 5,
    title: 'Identify the Thief',
    storyText: 'Connect the midnight entry to the cash trail.',
    objective: 'Identify the only guest matching every clue.',
    starterQuery: 'SELECT g.full_name, g.room_number\nFROM guests g;',
    hint: 'Join guests, access logs, and payments.',
    difficulty: 'HARD',
    orderSensitive: false,
    evidenceImageFilename: 'identify-thief.svg',
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
  feedback: 'Several guests stayed on the fourth floor near Room 417 that night — including the guest in Room 410 beside the crime scene.',
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

export const finalLevelExecution: QueryExecutionResult = {
  columns: ['full_name', 'room_number', 'entry_time', 'access_method', 'amount', 'payment_time'],
  rows: [['Julian Pike', 410, '2024-11-04T00:18:00Z', 'KEYCARD', 2500, '2024-11-04T01:02:00Z']],
  rowCount: 1,
  executionTimeMs: 15,
  correct: true,
  feedback: 'The same guest who slipped into Room 417 just after midnight later settled a large cash payment.',
}
