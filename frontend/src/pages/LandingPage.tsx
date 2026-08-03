import EvidencePhoto from '../components/EvidencePhoto'
import HotelIllustration from '../components/HotelIllustration'
import PrimaryButton from '../components/PrimaryButton'
import './LandingPage.css'

function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-page__sheet">
        <EvidencePhoto caption="Case archive illustration">
          <HotelIllustration />
        </EvidencePhoto>

        <h1 className="landing-page__title">SQL Detective.</h1>
        <p className="landing-page__subtitle">Query the evidence. Solve the case.</p>
        <p className="landing-page__description">
          Investigate fictional crimes by writing real SQL queries against hotel records,
          guest logs, and staff schedules.
        </p>

        <PrimaryButton to="/case/01">Start Investigation</PrimaryButton>
      </div>
    </main>
  )
}

export default LandingPage
