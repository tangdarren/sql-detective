import { useState } from 'react'
import CaseHeader from '../components/CaseHeader'
import ConfidentialStamp from '../components/ConfidentialStamp'
import EvidenceIllustration from '../components/EvidenceIllustration'
import EvidencePhoto from '../components/EvidencePhoto'
import InstructionsModal from '../components/InstructionsModal'
import PrimaryButton from '../components/PrimaryButton'
import { blackwoodHotelCase } from '../data/blackwoodCase'
import { CASE_01_ID, clearNotebook } from '../lib/notebookStorage'
import { resetProgress } from '../lib/progressStorage'
import './CaseIntroductionPage.css'

function CaseIntroductionPage() {
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  function handleRestartCase() {
    const confirmed = window.confirm(
      'Restart Case 01? This clears completed levels, saved SQL drafts, notebook notes, and evidence clippings.',
    )
    if (!confirmed) {
      return
    }
    resetProgress()
    clearNotebook(CASE_01_ID)
  }

  return (
    <main className="case-intro">
      <div className="case-intro__folder">
        <div className="case-intro__stamp">
          <ConfidentialStamp />
        </div>

        <CaseHeader
          title={blackwoodHotelCase.title}
          subtitle={blackwoodHotelCase.subtitle}
        />

        <div className="case-intro__layout">
          <EvidencePhoto caption="Crime scene sketch — Room 417">
            <EvidenceIllustration filename="missing-painting.svg" />
          </EvidencePhoto>

          <section className="case-intro__details">
            <h2 className="case-intro__section-title">Incident Report</h2>
            <p className="case-intro__copy">{blackwoodHotelCase.briefing}</p>
            <p className="case-intro__copy">
              A valuable painting disappeared from Room 417 during a private event.
              Cross-examine the hotel records. Follow the data. Name the thief.
            </p>

            <div className="case-intro__actions">
              <PrimaryButton to="/case/01/investigate">Open Case File</PrimaryButton>
              <button
                type="button"
                className="case-intro__secondary"
                onClick={() => setInstructionsOpen(true)}
              >
                Instructions
              </button>
              <button
                type="button"
                className="case-intro__secondary"
                onClick={handleRestartCase}
              >
                Restart Case
              </button>
            </div>
          </section>
        </div>
      </div>

      <InstructionsModal open={instructionsOpen} onClose={() => setInstructionsOpen(false)} />
    </main>
  )
}

export default CaseIntroductionPage
