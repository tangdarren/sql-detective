import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  executeQuery,
  fetchCase,
  fetchChallenge,
  fetchChallenges,
  fetchTable,
  fetchTables,
} from '../api/client'
import type {
  CaseSummary,
  ChallengeDetail,
  ChallengeSummary,
  ColumnInfo,
  QueryExecutionResult,
  TableSummary,
} from '../api/types'
import { ApiError } from '../api/types'
import { resolveEvidenceAsset } from '../assets/evidenceCatalog'
import CaseBriefing from '../components/CaseBriefing'
import CaseHeader from '../components/CaseHeader'
import DetectiveNotebook from '../components/DetectiveNotebook'
import EvidenceIllustration from '../components/EvidenceIllustration'
import EvidencePhoto from '../components/EvidencePhoto'
import InstructionsModal from '../components/InstructionsModal'
import LevelNavigation from '../components/LevelNavigation'
import PrimaryButton from '../components/PrimaryButton'
import QueryFeedback from '../components/QueryFeedback'
import QueryResults from '../components/QueryResults'
import SchemaExplorer from '../components/SchemaExplorer'
import SqlEditor from '../components/SqlEditor'
import { CASE_01_ID } from '../lib/notebookStorage'
import {
  clearDraft,
  getCompletedLevels,
  getDraft,
  getHighestUnlockedLevel,
  isLevelUnlocked,
  markLevelCompleted,
  resetProgress,
  saveDraft,
} from '../lib/progressStorage'
import './InvestigationWorkspacePage.css'

type LoadState = 'loading' | 'ready' | 'empty' | 'unavailable'

function InvestigationWorkspacePage() {
  const navigate = useNavigate()
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [caseSummary, setCaseSummary] = useState<CaseSummary | null>(null)
  const [challengeSummaries, setChallengeSummaries] = useState<ChallengeSummary[]>([])
  const [activeLevel, setActiveLevel] = useState(1)
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null)
  const [challengeLoading, setChallengeLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => getCompletedLevels())
  const [showHint, setShowHint] = useState(false)
  const [tables, setTables] = useState<TableSummary[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [columnsLoading, setColumnsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<QueryExecutionResult | null>(null)
  const [emptyResultMessage, setEmptyResultMessage] = useState(
    'No results yet. Run a query to inspect the evidence.',
  )

  const totalLevels = challengeSummaries.length

  useEffect(() => {
    let cancelled = false

    async function loadWorkspace() {
      setLoadState('loading')
      try {
        const [caseData, challenges, tableData] = await Promise.all([
          fetchCase(),
          fetchChallenges(),
          fetchTables(),
        ])

        if (cancelled) {
          return
        }

        if (challenges.length === 0) {
          setLoadState('empty')
          return
        }

        const unlocked = getHighestUnlockedLevel(challenges.length)
        setCaseSummary(caseData)
        setChallengeSummaries(challenges)
        setTables(tableData)
        setActiveLevel(unlocked)
        setCompletedLevels(getCompletedLevels())
        setLoadState('ready')
      } catch {
        if (!cancelled) {
          setLoadState('unavailable')
        }
      }
    }

    void loadWorkspace()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (loadState !== 'ready' || totalLevels === 0) {
      return
    }

    let cancelled = false

    async function loadChallenge(levelNumber: number) {
      setChallengeLoading(true)
      setResult(null)
      setShowHint(false)
      setEmptyResultMessage('No results yet. Run a query to inspect the evidence.')

      try {
        const detail = await fetchChallenge(levelNumber)
        if (cancelled) {
          return
        }
        setChallenge(detail)
        const draft = getDraft(levelNumber)
        setQuery(draft ?? detail.starterQuery)
      } catch {
        if (!cancelled) {
          setLoadState('unavailable')
        }
      } finally {
        if (!cancelled) {
          setChallengeLoading(false)
        }
      }
    }

    void loadChallenge(activeLevel)
    return () => {
      cancelled = true
    }
  }, [activeLevel, loadState, totalLevels])

  useEffect(() => {
    if (!selectedTable) {
      setColumns([])
      return
    }

    let cancelled = false

    async function loadColumns(tableName: string) {
      setColumnsLoading(true)
      try {
        const details = await fetchTable(tableName)
        if (!cancelled) {
          setColumns(details.columns)
        }
      } catch {
        if (!cancelled) {
          setColumns([])
        }
      } finally {
        if (!cancelled) {
          setColumnsLoading(false)
        }
      }
    }

    void loadColumns(selectedTable)
    return () => {
      cancelled = true
    }
  }, [selectedTable])

  const navigationLevels = useMemo(
    () =>
      challengeSummaries.map((item) => ({
        id: item.levelNumber,
        title: item.title,
        completed: completedLevels.includes(item.levelNumber),
        locked: !isLevelUnlocked(item.levelNumber, totalLevels),
      })),
    [challengeSummaries, completedLevels, totalLevels],
  )

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery)
    saveDraft(activeLevel, nextQuery)
  }

  function handleResetQuery() {
    if (!challenge) {
      return
    }
    setQuery(challenge.starterQuery)
    clearDraft(activeLevel)
    setResult(null)
    setEmptyResultMessage('No results yet. Run a query to inspect the evidence.')
  }

  async function handleRunQuery() {
    if (!challenge || isRunning) {
      return
    }

    setIsRunning(true)
    setResult(null)

    try {
      const execution = await executeQuery(activeLevel, query)
      setResult(execution)

      if (execution.correct) {
        const nextCompleted = markLevelCompleted(activeLevel)
        setCompletedLevels(nextCompleted)
      }

      if (!execution.errorType && execution.rowCount === 0) {
        setEmptyResultMessage('Your query ran, but returned no rows.')
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'The investigation archive is unavailable right now.'
      setResult({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        correct: false,
        feedback: message,
        errorType: 'EXECUTION_ERROR',
      })
    } finally {
      setIsRunning(false)
    }
  }

  function handleContinue() {
    const nextLevel = activeLevel + 1
    if (nextLevel <= totalLevels) {
      setActiveLevel(nextLevel)
    }
  }

  function handleCloseCase() {
    navigate('/case/01/complete')
  }

  function handleRestartCase() {
    const confirmed = window.confirm(
      'Restart Case 01? This clears completed levels and saved SQL drafts.',
    )
    if (!confirmed) {
      return
    }

    resetProgress()
    setCompletedLevels([])
    setResult(null)
    setShowHint(false)
    setEmptyResultMessage('No results yet. Run a query to inspect the evidence.')
    if (activeLevel === 1) {
      const first = challengeSummaries[0]
      if (first) {
        void fetchChallenge(1).then((detail) => {
          setChallenge(detail)
          setQuery(detail.starterQuery)
        })
      }
    } else {
      setActiveLevel(1)
    }
  }

  function handleSelectLevel(levelId: number) {
    if (!isLevelUnlocked(levelId, totalLevels)) {
      return
    }
    setActiveLevel(levelId)
  }

  if (loadState === 'loading') {
    return (
      <main className="workspace">
        <div className="workspace__status" role="status">
          Opening the case file…
        </div>
      </main>
    )
  }

  if (loadState === 'unavailable') {
    return (
      <main className="workspace">
        <div className="workspace__status workspace__status--error" role="alert">
          <p className="workspace__status-label">Connection error</p>
          <h1>Archive unavailable</h1>
          <p>
            The investigation server could not be reached. Start PostgreSQL and the Spring Boot
            API, then retry.
          </p>
          <ol className="workspace__status-steps">
            <li>
              <code>docker compose up -d</code>
            </li>
            <li>
              <code>cd backend && ./mvnw spring-boot:run</code>
            </li>
            <li>Reload this page</li>
          </ol>
          <PrimaryButton onClick={() => window.location.reload()}>Retry connection</PrimaryButton>
        </div>
      </main>
    )
  }

  if (loadState === 'empty') {
    return (
      <main className="workspace">
        <div className="workspace__status" role="status">
          <h1>No challenges found</h1>
          <p>This case file has no investigation levels yet.</p>
        </div>
      </main>
    )
  }

  const hasNextLevel = activeLevel < totalLevels
  const evidenceAsset = resolveEvidenceAsset(challenge?.evidenceImageFilename)

  return (
    <main className="workspace">
      <div className="workspace__folder">
        <div className="workspace__top">
          <CaseHeader
            title={caseSummary?.title ?? 'Case 01: The Blackwood Hotel'}
            subtitle={`Investigation Workspace · Level ${activeLevel}`}
          />
          <div className="workspace__toolbar">
            <button
              type="button"
              className="workspace__tool-button"
              onClick={() => setInstructionsOpen(true)}
            >
              Instructions
            </button>
            <button
              type="button"
              className="workspace__tool-button"
              onClick={handleRestartCase}
            >
              Restart Case
            </button>
          </div>
        </div>

        <div className="workspace__body">
          <aside className="workspace__left">
            <EvidencePhoto caption={evidenceAsset.caption}>
              <EvidenceIllustration filename={challenge?.evidenceImageFilename} />
            </EvidencePhoto>
            <LevelNavigation
              levels={navigationLevels}
              activeLevelId={activeLevel}
              onSelectLevel={handleSelectLevel}
            />
            <SchemaExplorer
              tables={tables}
              selectedTable={selectedTable}
              columns={columns}
              isLoadingColumns={columnsLoading}
              onSelectTable={setSelectedTable}
            />
            <DetectiveNotebook caseId={CASE_01_ID} />
          </aside>

          <section className="workspace__right">
            {challengeLoading || !challenge ? (
              <div className="workspace__panel-status" role="status">
                Loading challenge…
              </div>
            ) : (
              <CaseBriefing
                levelNumber={challenge.levelNumber}
                title={challenge.title}
                storyText={challenge.storyText}
                objective={challenge.objective}
                hint={challenge.hint}
                showHint={showHint}
                onToggleHint={() => setShowHint((value) => !value)}
              />
            )}

            <SqlEditor
              value={query}
              onChange={handleQueryChange}
              onRun={() => {
                void handleRunQuery()
              }}
              onReset={handleResetQuery}
              isRunning={isRunning}
              disabled={challengeLoading || !challenge}
            />

            {result ? (
              <QueryFeedback
                correct={result.correct}
                feedback={result.feedback}
                errorType={result.errorType}
                hasNextLevel={hasNextLevel}
                onContinue={handleContinue}
                onCloseCase={handleCloseCase}
              />
            ) : null}
          </section>
        </div>

        <div className="workspace__bottom">
          <QueryResults
            columns={result?.columns ?? []}
            rows={result?.rows ?? []}
            rowCount={result?.rowCount}
            executionTimeMs={result?.executionTimeMs}
            emptyMessage={emptyResultMessage}
            isProcessing={isRunning}
          />
        </div>
      </div>

      <InstructionsModal open={instructionsOpen} onClose={() => setInstructionsOpen(false)} />
    </main>
  )
}

export default InvestigationWorkspacePage
