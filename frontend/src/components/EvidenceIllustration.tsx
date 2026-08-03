type EvidenceIllustrationProps = {
  filename?: string | null
}

function EvidenceIllustration({ filename }: EvidenceIllustrationProps) {
  switch (filename) {
    case 'master-key.svg':
      return (
        <svg viewBox="0 0 320 220" role="img" aria-label="Black and white sketch of a hotel master key">
          <rect width="320" height="220" fill="#f5f5f5" />
          <rect x="18" y="18" width="284" height="184" fill="none" stroke="#111" strokeWidth="2" />
          <circle cx="110" cy="110" r="34" fill="#fff" stroke="#111" strokeWidth="2" />
          <circle cx="110" cy="110" r="12" fill="#ddd" stroke="#111" />
          <rect x="140" y="100" width="110" height="20" fill="#fff" stroke="#111" strokeWidth="2" />
          <rect x="220" y="100" width="12" height="8" fill="#111" />
          <rect x="236" y="100" width="12" height="12" fill="#111" />
          <text x="40" y="185" fill="#555" fontFamily="monospace" fontSize="11">
            EVIDENCE — MASTER KEY LEDGER
          </text>
        </svg>
      )
    case 'midnight-entry.svg':
      return (
        <svg viewBox="0 0 320 220" role="img" aria-label="Black and white sketch of a hallway door log at midnight">
          <rect width="320" height="220" fill="#f5f5f5" />
          <rect x="18" y="18" width="284" height="184" fill="none" stroke="#111" strokeWidth="2" />
          <rect x="70" y="50" width="80" height="120" fill="#fff" stroke="#111" strokeWidth="2" />
          <circle cx="135" cy="110" r="4" fill="#111" />
          <text x="88" y="90" fill="#111" fontFamily="monospace" fontSize="16">
            417
          </text>
          <rect x="180" y="60" width="90" height="70" fill="#fff" stroke="#111" strokeWidth="1.5" />
          <text x="190" y="85" fill="#333" fontFamily="monospace" fontSize="11">
            00:18 KEYCARD
          </text>
          <text x="190" y="105" fill="#333" fontFamily="monospace" fontSize="11">
            01:05 BADGE
          </text>
          <text x="40" y="185" fill="#555" fontFamily="monospace" fontSize="11">
            EVIDENCE — MIDNIGHT ACCESS LOG
          </text>
        </svg>
      )
    case 'suspicious-payments.svg':
      return (
        <svg viewBox="0 0 320 220" role="img" aria-label="Black and white sketch of cash payment records">
          <rect width="320" height="220" fill="#f5f5f5" />
          <rect x="18" y="18" width="284" height="184" fill="none" stroke="#111" strokeWidth="2" />
          <rect x="55" y="55" width="210" height="90" fill="#fff" stroke="#111" strokeWidth="2" />
          <text x="70" y="85" fill="#111" fontFamily="monospace" fontSize="13">
            CASH TOTAL
          </text>
          <text x="70" y="115" fill="#111" fontFamily="serif" fontSize="28">
            $2,575
          </text>
          <text x="40" y="185" fill="#555" fontFamily="monospace" fontSize="11">
            EVIDENCE — LOBBY CASH LEDGER
          </text>
        </svg>
      )
    case 'identify-thief.svg':
      return (
        <svg viewBox="0 0 320 220" role="img" aria-label="Black and white sketch connecting door logs and payments">
          <rect width="320" height="220" fill="#f5f5f5" />
          <rect x="18" y="18" width="284" height="184" fill="none" stroke="#111" strokeWidth="2" />
          <rect x="45" y="55" width="90" height="60" fill="#fff" stroke="#111" strokeWidth="2" />
          <text x="58" y="90" fill="#111" fontFamily="monospace" fontSize="12">
            ROOM 417
          </text>
          <rect x="185" y="55" width="90" height="60" fill="#fff" stroke="#111" strokeWidth="2" />
          <text x="205" y="90" fill="#111" fontFamily="monospace" fontSize="12">
            CASH
          </text>
          <line x1="135" y1="85" x2="185" y2="85" stroke="#111" strokeWidth="2" />
          <circle cx="160" cy="140" r="22" fill="#fff" stroke="#111" strokeWidth="2" />
          <text x="148" y="145" fill="#111" fontFamily="serif" fontSize="14">
            ?
          </text>
          <text x="40" y="185" fill="#555" fontFamily="monospace" fontSize="11">
            EVIDENCE — CONNECTED CLUES
          </text>
        </svg>
      )
    case 'final-suspect.svg':
      return (
        <svg viewBox="0 0 320 220" role="img" aria-label="Black and white final suspect sketch of Julian Pike">
          <rect width="320" height="220" fill="#f5f5f5" />
          <rect x="18" y="18" width="284" height="184" fill="none" stroke="#111" strokeWidth="2" />
          <circle cx="160" cy="88" r="36" fill="#fff" stroke="#111" strokeWidth="2" />
          <path d="M120 160c10-28 70-28 80 0" fill="none" stroke="#111" strokeWidth="2" />
          <rect x="95" y="155" width="130" height="28" fill="#fff" stroke="#111" strokeWidth="1.5" />
          <text x="112" y="174" fill="#111" fontFamily="serif" fontSize="14">
            JULIAN PIKE
          </text>
          <text x="40" y="200" fill="#555" fontFamily="monospace" fontSize="11">
            FINAL SUSPECT — ROOM 410
          </text>
        </svg>
      )
    case 'guest-registry.svg':
    default:
      return (
        <svg viewBox="0 0 320 220" role="img" aria-label="Black and white sketch of a hotel guest registry">
          <rect width="320" height="220" fill="#f5f5f5" />
          <rect x="18" y="18" width="284" height="184" fill="none" stroke="#111" strokeWidth="2" />
          <rect x="50" y="45" width="220" height="120" fill="#fff" stroke="#111" strokeWidth="2" />
          <line x1="50" y1="75" x2="270" y2="75" stroke="#111" />
          <line x1="50" y1="105" x2="270" y2="105" stroke="#111" />
          <line x1="50" y1="135" x2="270" y2="135" stroke="#111" />
          <line x1="140" y1="45" x2="140" y2="165" stroke="#111" />
          <line x1="210" y1="45" x2="210" y2="165" stroke="#111" />
          <text x="60" y="65" fill="#333" fontFamily="monospace" fontSize="11">
            NAME
          </text>
          <text x="155" y="65" fill="#333" fontFamily="monospace" fontSize="11">
            ROOM
          </text>
          <text x="225" y="65" fill="#333" fontFamily="monospace" fontSize="11">
            VIP
          </text>
          <text x="60" y="95" fill="#111" fontFamily="serif" fontSize="12">
            A. Blackwood
          </text>
          <text x="160" y="95" fill="#111" fontFamily="monospace" fontSize="12">
            417
          </text>
          <text x="40" y="185" fill="#555" fontFamily="monospace" fontSize="11">
            EVIDENCE — GUEST REGISTRY
          </text>
        </svg>
      )
  }
}

export default EvidenceIllustration
