import { expect, test } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { clearProgress, mockApi } from './fixtures'

const shotDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs/screenshots')

test('capture portfolio screenshots', async ({ page }) => {
  await clearProgress(page)
  await mockApi(page)

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'SQL Detective.' })).toBeVisible()
  await page.screenshot({
    path: path.join(shotDir, 'landing.png'),
    fullPage: true,
  })

  await page.goto('/case/01/investigate')
  await expect(page.getByRole('heading', { name: 'The Guest Registry' })).toBeVisible()
  await page.screenshot({
    path: path.join(shotDir, 'workspace.png'),
    fullPage: true,
  })
})
