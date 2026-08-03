import './ConfidentialStamp.css'

type ConfidentialStampProps = {
  label?: string
}

function ConfidentialStamp({ label = 'CONFIDENTIAL' }: ConfidentialStampProps) {
  return (
    <span className="confidential-stamp" aria-hidden="true">
      {label}
    </span>
  )
}

export default ConfidentialStamp
