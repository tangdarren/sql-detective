import { useState } from 'react'
import EvidenceIllustration from '../components/EvidenceIllustration'
import EvidencePhoto from '../components/EvidencePhoto'
import InstructionsModal from '../components/InstructionsModal'
import PrimaryButton from '../components/PrimaryButton'
import './LandingPage.css'

function LandingPage() {
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  return (
    <main className="landing-page">
      <div className="landing-page__sheet">
        <EvidencePhoto caption="Blackwood Hotel — exterior">
          <EvidenceIllustration filename="hotel-exterior.svg" />
        </EvidencePhoto>

        <p className="landing-page__eyebrow">Case file archive</p>
        <h1 className="landing-page__title">SQL Detective.</h1>
        <p className="landing-page__subtitle">Query the evidence. Solve the case.</p>
        <p className="landing-page__description">
          A short mystery game where you investigate a fictional hotel theft by writing
          real SQL against guest logs, staff records, and payment ledgers.
        </p>

        <div className="landing-page__actions">
          <PrimaryButton to="/case/01">Start Investigation</PrimaryButton>
          <button
            type="button"
            className="landing-page__ghost"
            onClick={() => setInstructionsOpen(true)}
          >
            Instructions
          </button>
        </div>

        <section className="landing-page__concepts" aria-labelledby="sql-concepts-title">
          <h2 id="sql-concepts-title">SQL concepts you will use</h2>
          <ul>
            <li>
              <strong>SELECT / WHERE / ORDER BY</strong> — list and filter hotel guests
            </li>
            <li>
              <strong>INNER JOIN</strong> — connect employees to door access logs
            </li>
            <li>
              <strong>Timestamps &amp; BETWEEN</strong> — find midnight entries
            </li>
            <li>
              <strong>GROUP BY / HAVING</strong> — spot unusual cash totals
            </li>
            <li>
              <strong>Multiple joins</strong> — combine clues to name the thief
            </li>
          </ul>
        </section>
      </div>

      <InstructionsModal open={instructionsOpen} onClose={() => setInstructionsOpen(false)} />
    </main>
  )
}

export default LandingPage
