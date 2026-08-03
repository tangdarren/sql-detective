import ConfidentialStamp from './ConfidentialStamp'
import PrimaryButton from './PrimaryButton'
import type { QueryErrorType } from '../api/types'
import './QueryFeedback.css'

type QueryFeedbackProps = {
  correct: boolean
  feedback: string
  errorType?: QueryErrorType | null
  hasNextLevel: boolean
  onContinue: () => void
  onCloseCase?: () => void
}

function toneFor(errorType?: QueryErrorType | null, correct?: boolean): string {
  if (correct) {
    return 'query-feedback--success'
  }
  if (errorType === 'FORBIDDEN_STATEMENT') {
    return 'query-feedback--warning'
  }
  if (errorType === 'SYNTAX_ERROR' || errorType === 'TIMEOUT' || errorType === 'EXECUTION_ERROR') {
    return 'query-feedback--error'
  }
  return 'query-feedback--incorrect'
}

function QueryFeedback({
  correct,
  feedback,
  errorType,
  hasNextLevel,
  onContinue,
  onCloseCase,
}: QueryFeedbackProps) {
  return (
    <section
      className={`query-feedback ${toneFor(errorType, correct)}`}
      aria-live="polite"
      aria-label="Query feedback"
    >
      {correct ? (
        <div className="query-feedback__stamp">
          <ConfidentialStamp label="CASE SOLVED" />
        </div>
      ) : null}

      <h2 className="query-feedback__title">
        {correct
          ? 'Evidence confirmed'
          : errorType === 'FORBIDDEN_STATEMENT'
            ? 'Query blocked'
            : errorType === 'SYNTAX_ERROR'
              ? 'Syntax error'
              : errorType
                ? 'Query failed'
                : 'Not quite'}
      </h2>
      <p className="query-feedback__message">{feedback}</p>

      {correct && hasNextLevel ? (
        <PrimaryButton onClick={onContinue}>Continue Investigation</PrimaryButton>
      ) : null}
      {correct && !hasNextLevel ? (
        <>
          <p className="query-feedback__finale">
            The Blackwood Hotel file is ready to close. The thief has been identified.
          </p>
          {onCloseCase ? (
            <PrimaryButton onClick={onCloseCase}>Close the Case</PrimaryButton>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

export default QueryFeedback
