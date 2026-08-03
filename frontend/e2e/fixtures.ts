import type { Page, Route } from '@playwright/test'

const caseSummary = {
  caseId: 'blackwood',
  title: 'Case 01: The Blackwood Hotel',
  subtitle: 'The Missing Portrait',
  synopsis: 'A valuable painting disappeared from Room 417.',
  setting: 'Blackwood Hotel',
  eventDate: '2024-11-03',
  challengeCount: 5,
}

const challenges = [
  { levelNumber: 1, title: 'The Guest Registry', difficulty: 'EASY' },
  { levelNumber: 2, title: 'The Missing Master Key', difficulty: 'MEDIUM' },
  { levelNumber: 3, title: 'Midnight Entry', difficulty: 'MEDIUM' },
  { levelNumber: 4, title: 'Suspicious Payments', difficulty: 'MEDIUM' },
  { levelNumber: 5, title: 'Identify the Thief', difficulty: 'HARD' },
]

function challengeDetail(level: number) {
  const titles: Record<number, string> = {
    1: 'The Guest Registry',
    2: 'The Missing Master Key',
    3: 'Midnight Entry',
    4: 'Suspicious Payments',
    5: 'Identify the Thief',
  }
  const images: Record<number, string> = {
    1: 'guest-registry.svg',
    2: 'master-key.svg',
    3: 'midnight-entry.svg',
    4: 'suspicious-payments.svg',
    5: 'identify-thief.svg',
  }
  const starters: Record<number, string> = {
    1: 'SELECT full_name, room_number, vip_status\nFROM guests;',
    2: 'SELECT e.full_name, e.job_title\nFROM employees e;',
    3: 'SELECT room_number, person_type, person_id, entry_time\nFROM room_access_logs;',
    4: 'SELECT g.full_name, COUNT(*) AS payment_count\nFROM payments p\nINNER JOIN guests g ON g.id = p.guest_id;',
    5: 'SELECT g.full_name, g.room_number\nFROM guests g;',
  }

  return {
    levelNumber: level,
    title: titles[level] ?? `Level ${level}`,
    storyText: `Level ${level} investigation notes.`,
    objective: `Complete the objective for level ${level}.`,
    starterQuery: starters[level] ?? 'SELECT 1;',
    hint: 'Read the objective carefully.',
    difficulty: level === 1 ? 'EASY' : level === 5 ? 'HARD' : 'MEDIUM',
    orderSensitive: level === 1,
    evidenceImageFilename: images[level] ?? 'guest-registry.svg',
  }
}

async function json(route: Route, body: unknown) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

export async function mockApi(page: Page) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname
    const method = route.request().method()

    if (path === '/api/cases/blackwood' && method === 'GET') {
      await json(route, caseSummary)
      return
    }

    if (path === '/api/challenges' && method === 'GET') {
      await json(route, challenges)
      return
    }

    const challengeMatch = path.match(/^\/api\/challenges\/(\d+)$/)
    if (challengeMatch && method === 'GET') {
      await json(route, challengeDetail(Number(challengeMatch[1])))
      return
    }

    const executeMatch = path.match(/^\/api\/challenges\/(\d+)\/execute$/)
    if (executeMatch && method === 'POST') {
      const body = route.request().postDataJSON() as { query?: string }
      const query = (body.query ?? '').trim().toLowerCase()

      if (/\b(insert|update|delete|drop)\b/.test(query)) {
        await json(route, {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: 1,
          correct: false,
          feedback: 'Only read-only SELECT queries are allowed.',
          errorType: 'FORBIDDEN_STATEMENT',
        })
        return
      }

      if (query.includes('join join') || /join\s*$/.test(query)) {
        await json(route, {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: 1,
          correct: false,
          feedback: 'Your SQL contains a syntax error near JOIN.',
          errorType: 'SYNTAX_ERROR',
        })
        return
      }

      if (query.includes('between 410 and 422') || query.includes('solve-level-1')) {
        await json(route, {
          columns: ['full_name', 'room_number', 'vip_status'],
          rows: [['Julian Pike', 410, true]],
          rowCount: 1,
          executionTimeMs: 12,
          correct: true,
          feedback:
            'Several guests stayed on the fourth floor near Room 417 that night — including the guest in Room 410 beside the crime scene.',
        })
        return
      }

      if (query.includes('solve-level-5') || query.includes('amount > 2000')) {
        await json(route, {
          columns: ['full_name', 'room_number'],
          rows: [['Julian Pike', 410]],
          rowCount: 1,
          executionTimeMs: 14,
          correct: true,
          feedback:
            'The same guest who slipped into Room 417 just after midnight later settled a large cash payment.',
        })
        return
      }

      await json(route, {
        columns: ['full_name'],
        rows: [['Someone']],
        rowCount: 1,
        executionTimeMs: 8,
        correct: false,
        feedback: 'Check which columns the objective requests.',
      })
      return
    }

    if (path === '/api/schema/tables' && method === 'GET') {
      await json(route, [
        { name: 'guests', description: 'Registered hotel guests.' },
        { name: 'employees', description: 'Hotel staff.' },
      ])
      return
    }

    if (path.startsWith('/api/schema/tables/') && method === 'GET') {
      await json(route, {
        name: 'guests',
        description: 'Registered hotel guests.',
        columns: [
          { name: 'full_name', dataType: 'text', nullable: false, defaultValue: null },
          { name: 'room_number', dataType: 'integer', nullable: false, defaultValue: null },
        ],
      })
      return
    }

    await route.fulfill({ status: 404, body: 'Not mocked' })
  })
}

export async function clearProgress(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('sql-detective:blackwood:completedLevels')
    localStorage.removeItem('sql-detective:blackwood:drafts')
  })
}
