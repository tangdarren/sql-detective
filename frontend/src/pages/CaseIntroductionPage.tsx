import CaseHeader from '../components/CaseHeader'
import ConfidentialStamp from '../components/ConfidentialStamp'
import EvidencePhoto from '../components/EvidencePhoto'
import HotelIllustration from '../components/HotelIllustration'
import PrimaryButton from '../components/PrimaryButton'
import { blackwoodHotelCase } from '../data/placeholderChallenge'
import './CaseIntroductionPage.css'

function CaseIntroductionPage() {
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
            <HotelIllustration variant="room" />
          </EvidencePhoto>

          <section className="case-intro__details">
            <h2 className="case-intro__section-title">Incident Report</h2>
            <p className="case-intro__copy">{blackwoodHotelCase.briefing}</p>
            <p className="case-intro__copy">
              A valuable painting disappeared from Room 417 during a private event.
              Cross-examine the hotel records. Follow the data. Name the thief.
            </p>
            <PrimaryButton to="/case/01/investigate">Open Case File</PrimaryButton>
          </section>
        </div>
      </div>
    </main>
  )
}

export default CaseIntroductionPage
