import { expect, test } from '@playwright/test'
import { clearProgress, mockApi } from './fixtures'

test.describe('SQL Detective investigation flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearProgress(page)
    await mockApi(page)
  })

  test('opens the case and starts Level 1', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'SQL Detective.' })).toBeVisible()
    await page.getByRole('link', { name: 'Start Investigation' }).click()
    await expect(page.getByRole('heading', { name: 'Case 01: The Blackwood Hotel' })).toBeVisible()
    await page.getByRole('link', { name: 'Open Case File' }).click()
    await expect(page.getByText(/Investigation Workspace/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'The Guest Registry' })).toBeVisible()
    await expect(page.getByLabel('SQL query editor')).toBeVisible()
  })

  test('runs an incorrect query', async ({ page }) => {
    await page.goto('/case/01/investigate')
    await page.getByLabel('SQL query editor').fill('SELECT full_name FROM guests;')
    await page.getByRole('button', { name: 'Run Query' }).click()
    await expect(page.getByText('Not quite')).toBeVisible()
    await expect(page.getByText('Check which columns the objective requests.')).toBeVisible()
  })

  test('runs a forbidden query', async ({ page }) => {
    await page.goto('/case/01/investigate')
    await page.getByLabel('SQL query editor').fill('DELETE FROM guests;')
    await page.getByRole('button', { name: 'Run Query' }).click()
    await expect(page.getByText('Query blocked')).toBeVisible()
    await expect(page.getByText('Only read-only SELECT queries are allowed.')).toBeVisible()
  })

  test('solves a level and unlocks the next level', async ({ page }) => {
    await page.goto('/case/01/investigate')
    await expect(page.getByRole('button', { name: /The Missing Master Key/i })).toBeDisabled()
    await page.getByLabel('SQL query editor').fill(
      "SELECT full_name, room_number, vip_status FROM guests WHERE room_number BETWEEN 410 AND 422;",
    )
    await page.getByRole('button', { name: 'Run Query' }).click()
    await expect(page.getByText('CASE SOLVED')).toBeVisible()
    await expect(page.getByRole('button', { name: /The Missing Master Key/i })).toBeEnabled()
    await page.getByRole('button', { name: 'Continue Investigation' }).click()
    await expect(page.getByRole('heading', { name: 'The Missing Master Key' })).toBeVisible()
  })

  test('restores saved progress', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sql-detective:blackwood:completedLevels', JSON.stringify([1]))
      localStorage.setItem(
        'sql-detective:blackwood:drafts',
        JSON.stringify({ '2': 'SELECT e.full_name FROM employees e;' }),
      )
    })
    await page.goto('/case/01/investigate')
    await expect(page.getByRole('heading', { name: 'The Missing Master Key' })).toBeVisible()
    await expect(page.getByLabel('SQL query editor')).toHaveValue(
      'SELECT e.full_name FROM employees e;',
    )
  })

  test('completes the final case and restarts the game', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'sql-detective:blackwood:completedLevels',
        JSON.stringify([1, 2, 3, 4]),
      )
    })
    await page.goto('/case/01/investigate')
    await expect(page.getByRole('heading', { name: 'Identify the Thief' })).toBeVisible()
    await page.getByLabel('SQL query editor').fill(
      'SELECT g.full_name, g.room_number FROM guests g WHERE amount > 2000;',
    )
    await page.getByRole('button', { name: 'Run Query' }).click()
    await expect(page.getByRole('button', { name: 'Close the Case' })).toBeVisible()
    await page.getByRole('button', { name: 'Close the Case' }).click()
    await expect(page.getByText('CASE CLOSED')).toBeVisible()
    await expect(page.getByText('Julian Pike', { exact: true })).toBeVisible()

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Play Again' }).click()
    await expect(page.getByRole('heading', { name: 'The Guest Registry' })).toBeVisible()

    const completed = await page.evaluate(() =>
      localStorage.getItem('sql-detective:blackwood:completedLevels'),
    )
    expect(completed).toBeNull()
  })
})
