import { Navigate, Route, Routes } from 'react-router-dom'
import CaseCompletionPage from './pages/CaseCompletionPage'
import CaseIntroductionPage from './pages/CaseIntroductionPage'
import InvestigationWorkspacePage from './pages/InvestigationWorkspacePage'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/case/01" element={<CaseIntroductionPage />} />
      <Route path="/case/01/investigate" element={<InvestigationWorkspacePage />} />
      <Route path="/case/01/complete" element={<CaseCompletionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
