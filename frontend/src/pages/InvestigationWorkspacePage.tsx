import { useMemo, useState } from 'react'
import CaseBriefing from '../components/CaseBriefing'
import CaseHeader from '../components/CaseHeader'
import EvidencePhoto from '../components/EvidencePhoto'
import HotelIllustration from '../components/HotelIllustration'
import LevelNavigation from '../components/LevelNavigation'
import QueryResults from '../components/QueryResults'
import SqlEditor from '../components/SqlEditor'
import { blackwoodHotelCase } from '../data/placeholderChallenge'
import './InvestigationWorkspacePage.css'

function InvestigationWorkspacePage() {
  const [activeLevelId, setActiveLevelId] = useState(blackwoodHotelCase.levels[0].id)
  const [query, setQuery] = useState(blackwoodHotelCase.sampleQuery)
  const [hasRunQuery, setHasRunQuery] = useState(false)

  const activeLevel = useMemo(
    () =>
      blackwoodHotelCase.levels.find((level) => level.id === activeLevelId)
      ?? blackwoodHotelCase.levels[0],
    [activeLevelId],
  )

  return (
    <main className="workspace">
      <div className="workspace__folder">
        <CaseHeader
          title={blackwoodHotelCase.title}
          subtitle="Investigation Workspace"
        />

        <div className="workspace__body">
          <aside className="workspace__left">
            <EvidencePhoto caption="Evidence photo — Blackwood Hotel">
              <HotelIllustration variant="room" />
            </EvidencePhoto>
            <LevelNavigation
              levels={blackwoodHotelCase.levels}
              activeLevelId={activeLevel.id}
              onSelectLevel={setActiveLevelId}
            />
          </aside>

          <section className="workspace__right">
            <CaseBriefing title={activeLevel.title} objective={activeLevel.objective} />
            <SqlEditor
              value={query}
              onChange={setQuery}
              onRun={() => setHasRunQuery(true)}
            />
          </section>
        </div>

        <div className="workspace__bottom">
          <QueryResults rows={hasRunQuery ? blackwoodHotelCase.sampleResults : []} />
        </div>
      </div>
    </main>
  )
}

export default InvestigationWorkspacePage
