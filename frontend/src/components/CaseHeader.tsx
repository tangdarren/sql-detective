import './CaseHeader.css'

type CaseHeaderProps = {
  title: string
  subtitle?: string
}

function CaseHeader({ title, subtitle }: CaseHeaderProps) {
  return (
    <header className="case-header">
      <p className="case-header__file">Case File</p>
      <h1 className="case-header__title">{title}</h1>
      {subtitle ? <p className="case-header__subtitle">{subtitle}</p> : null}
    </header>
  )
}

export default CaseHeader
