import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the landing page content', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'SQL Detective.' })).toBeInTheDocument()
    expect(screen.getByText('Query the evidence. Solve the case.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Investigation' })).toBeInTheDocument()
  })
})
