import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement, ReactNode } from 'react'

type Options = {
  route?: string
} & Omit<RenderOptions, 'wrapper'>

export function renderWithRouter(ui: ReactElement, { route = '/', ...options }: Options = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
