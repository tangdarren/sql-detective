export type CaseSummary = {
  caseId: string
  title: string
  subtitle: string
  synopsis: string
  setting: string
  eventDate: string
  challengeCount: number
}

export type ChallengeSummary = {
  levelNumber: number
  title: string
  difficulty: string
}

export type ChallengeDetail = {
  levelNumber: number
  title: string
  storyText: string
  objective: string
  starterQuery: string
  hint: string
  difficulty: string
  orderSensitive: boolean
  evidenceImageFilename: string
}

export type TableSummary = {
  name: string
  description: string
}

export type ColumnInfo = {
  name: string
  dataType: string
  nullable: boolean
  defaultValue: string | null
}

export type TableDetails = {
  name: string
  description: string
  columns: ColumnInfo[]
}

export type QueryErrorType =
  | 'FORBIDDEN_STATEMENT'
  | 'SYNTAX_ERROR'
  | 'TIMEOUT'
  | 'EXECUTION_ERROR'

export type QueryExecutionResult = {
  columns: string[]
  rows: unknown[][]
  rowCount: number
  executionTimeMs: number
  correct: boolean
  feedback: string
  errorType?: QueryErrorType | null
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
