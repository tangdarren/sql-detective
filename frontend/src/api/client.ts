import type {
  CaseSummary,
  ChallengeDetail,
  ChallengeSummary,
  QueryExecutionResult,
  TableDetails,
  TableSummary,
} from './types'
import { ApiError } from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...init,
    })
  } catch {
    throw new ApiError('The investigation archive is unavailable right now.', 0)
  }

  if (!response.ok) {
    let message = 'The investigation archive is unavailable right now.'
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) {
        message = body.message
      }
    } catch {
      // keep default message
    }
    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}

export function fetchCase(): Promise<CaseSummary> {
  return request<CaseSummary>('/api/cases/blackwood')
}

export function fetchChallenges(): Promise<ChallengeSummary[]> {
  return request<ChallengeSummary[]>('/api/challenges')
}

export function fetchChallenge(levelNumber: number): Promise<ChallengeDetail> {
  return request<ChallengeDetail>(`/api/challenges/${levelNumber}`)
}

export function fetchTables(): Promise<TableSummary[]> {
  return request<TableSummary[]>('/api/schema/tables')
}

export function fetchTable(tableName: string): Promise<TableDetails> {
  return request<TableDetails>(`/api/schema/tables/${tableName}`)
}

export function executeQuery(levelNumber: number, query: string): Promise<QueryExecutionResult> {
  return request<QueryExecutionResult>(`/api/challenges/${levelNumber}/execute`, {
    method: 'POST',
    body: JSON.stringify({ query }),
  })
}
