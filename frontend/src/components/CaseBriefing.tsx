import './CaseBriefing.css'

type CaseBriefingProps = {
  levelNumber: number
  title: string
  storyText: string
  objective: string
  hint: string
  showHint: boolean
  onToggleHint: () => void
}

function CaseBriefing({
  levelNumber,
  title,
  storyText,
  objective,
  hint,
  showHint,
  onToggleHint,
}: CaseBriefingProps) {
  return (
    <section className="case-briefing" aria-labelledby="case-briefing-title">
      <p className="case-briefing__level">Level {levelNumber}</p>
      <h2 id="case-briefing-title" className="case-briefing__title">
        {title}
      </h2>
      <p className="case-briefing__story">{storyText}</p>

      <h3 className="case-briefing__subtitle">Objective</h3>
      <p className="case-briefing__objective">{objective}</p>

      <button type="button" className="case-briefing__hint-toggle" onClick={onToggleHint}>
        {showHint ? 'Hide Hint' : 'Show Hint'}
      </button>
      {showHint ? <p className="case-briefing__hint">{hint}</p> : null}
    </section>
  )
}

export default CaseBriefing
