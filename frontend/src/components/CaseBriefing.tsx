import './CaseBriefing.css'

type CaseBriefingProps = {
  title: string
  objective: string
}

function CaseBriefing({ title, objective }: CaseBriefingProps) {
  return (
    <section className="case-briefing" aria-labelledby="case-briefing-title">
      <h2 id="case-briefing-title" className="case-briefing__title">
        Objective
      </h2>
      <p className="case-briefing__level">{title}</p>
      <p className="case-briefing__objective">{objective}</p>
    </section>
  )
}

export default CaseBriefing
