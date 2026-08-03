import './App.css'
import DetectivePlaceholder from './components/DetectivePlaceholder'

function App() {
  return (
    <main className="landing">
      <div className="landing__content">
        <DetectivePlaceholder />
        <h1 className="landing__title">SQL Detective.</h1>
        <p className="landing__subtitle">Query the evidence. Solve the case.</p>
        <p className="landing__hint">
          <code>SELECT clue FROM evidence WHERE case_id = 1;</code>
        </p>
        <button type="button" className="landing__cta">
          Start Investigation
        </button>
      </div>
    </main>
  )
}

export default App
