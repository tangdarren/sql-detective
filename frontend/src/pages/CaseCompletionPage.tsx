import { Navigate, useNavigate } from 'react-router-dom'
import CaseHeader from '../components/CaseHeader'
import ConfidentialStamp from '../components/ConfidentialStamp'
import EvidenceIllustration from '../components/EvidenceIllustration'
import EvidencePhoto from '../components/EvidencePhoto'
import PrimaryButton from '../components/PrimaryButton'
import { blackwoodResolution } from '../data/blackwoodResolution'
import { CASE_01_ID, clearNotebook } from '../lib/notebookStorage'
import { areAllLevelsCompleted, resetProgress } from '../lib/progressStorage'
import './CaseCompletionPage.css'

const TOTAL_LEVELS = 5

function CaseCompletionPage() {
  const navigate = useNavigate()
  const caseClosed = areAllLevelsCompleted(TOTAL_LEVELS)

  if (!caseClosed) {
    return <Navigate to="/case/01/investigate" replace />
  }

  function handlePlayAgain() {
    resetProgress()
    clearNotebook(CASE_01_ID)
    navigate('/case/01/investigate')
  }

  return (
    <main className="case-complete">
      <div className="case-complete__folder">
        <div className="case-complete__stamp">
          <ConfidentialStamp label="CASE CLOSED" />
        </div>

        <CaseHeader
          title={blackwoodResolution.caseTitle}
          subtitle="Final report — the thief is identified"
        />

        <div className="case-complete__layout">
          <EvidencePhoto caption="Final suspect sketch — Room 410">
            <EvidenceIllustration filename="final-thief-reveal.svg" />
          </EvidencePhoto>

          <section className="case-complete__details">
            <h2 className="case-complete__thief-label">The thief</h2>
            <p className="case-complete__thief-name">{blackwoodResolution.thiefName}</p>
            <p className="case-complete__copy">{blackwoodResolution.explanation}</p>

            <h3 className="case-complete__section-title">How the evidence connects</h3>
            <ul className="case-complete__evidence">
              {blackwoodResolution.evidencePoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            <h3 className="case-complete__section-title">Levels completed</h3>
            <ol className="case-complete__levels">
              {blackwoodResolution.levels.map((level) => (
                <li key={level.levelNumber}>
                  <strong>
                    Level {level.levelNumber}: {level.title}
                  </strong>
                  <span>{level.summary}</span>
                </li>
              ))}
            </ol>

            <div className="case-complete__actions">
              <PrimaryButton onClick={handlePlayAgain}>Play Again</PrimaryButton>
              <PrimaryButton to="/case/01" className="case-complete__secondary">
                Return to Case File
              </PrimaryButton>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default CaseCompletionPage
