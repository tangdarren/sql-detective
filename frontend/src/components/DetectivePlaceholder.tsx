import './DetectivePlaceholder.css'

function DetectivePlaceholder() {
  return (
    <figure className="detective-placeholder" aria-label="Detective silhouette placeholder">
      <svg
        className="detective-placeholder__svg"
        viewBox="0 0 160 160"
        role="img"
        aria-hidden="true"
      >
        <rect width="160" height="160" fill="#111" />
        <circle cx="80" cy="58" r="22" fill="#f5f5f5" />
        <path
          d="M40 128c8-28 28-42 40-42s32 14 40 42"
          fill="#f5f5f5"
        />
        <rect x="52" y="48" width="56" height="8" rx="2" fill="#111" />
        <path
          d="M48 52c0-18 14-30 32-30s32 12 32 30"
          fill="none"
          stroke="#f5f5f5"
          strokeWidth="6"
        />
      </svg>
      <figcaption className="detective-placeholder__caption">
        Case file photo forthcoming
      </figcaption>
    </figure>
  )
}

export default DetectivePlaceholder
