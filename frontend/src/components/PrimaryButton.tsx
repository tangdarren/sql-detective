import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './PrimaryButton.css'

type ButtonAsButton = {
  to?: undefined
} & ButtonHTMLAttributes<HTMLButtonElement>

type ButtonAsLink = {
  to: string
  children: ReactNode
  className?: string
}

type PrimaryButtonProps = (ButtonAsButton | ButtonAsLink) & {
  children: ReactNode
}

function PrimaryButton(props: PrimaryButtonProps) {
  const className = ['primary-button', props.className].filter(Boolean).join(' ')

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={className}>
        {props.children}
      </Link>
    )
  }

  const { className: _ignored, children, ...buttonProps } = props as ButtonAsButton

  return (
    <button type="button" className={className} {...buttonProps}>
      {children}
    </button>
  )
}

export default PrimaryButton
