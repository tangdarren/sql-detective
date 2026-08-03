type HotelIllustrationProps = {
  variant?: 'facade' | 'room'
}

function HotelIllustration({ variant = 'facade' }: HotelIllustrationProps) {
  if (variant === 'room') {
    return (
      <svg viewBox="0 0 320 220" role="img" aria-label="Black and white crime scene sketch of Room 417">
        <rect width="320" height="220" fill="#f5f5f5" />
        <rect x="18" y="18" width="284" height="184" fill="none" stroke="#111" strokeWidth="2" />
        <rect x="40" y="40" width="110" height="80" fill="#fff" stroke="#111" strokeWidth="2" />
        <rect x="58" y="55" width="74" height="50" fill="#ddd" stroke="#111" strokeWidth="1.5" />
        <text x="70" y="85" fill="#333" fontFamily="serif" fontSize="14">
          Portrait
        </text>
        <line x1="40" y1="150" x2="280" y2="150" stroke="#111" strokeWidth="1.5" />
        <rect x="190" y="118" width="70" height="32" fill="#fff" stroke="#111" strokeWidth="1.5" />
        <text x="205" y="138" fill="#111" fontFamily="monospace" fontSize="12">
          417
        </text>
        <path d="M210 70c12-18 28-18 40 0" fill="none" stroke="#111" strokeWidth="2" />
        <circle cx="230" cy="78" r="3" fill="#111" />
        <text x="40" y="185" fill="#555" fontFamily="monospace" fontSize="11">
          EVIDENCE PHOTO — ROOM 417
        </text>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 320 220" role="img" aria-label="Black and white illustration of the Blackwood Hotel">
      <rect width="320" height="220" fill="#f5f5f5" />
      <rect x="50" y="40" width="220" height="140" fill="#fff" stroke="#111" strokeWidth="2" />
      <polygon points="40,40 160,10 280,40" fill="#eee" stroke="#111" strokeWidth="2" />
      <rect x="140" y="120" width="40" height="60" fill="#222" />
      <rect x="70" y="60" width="28" height="28" fill="#ddd" stroke="#111" />
      <rect x="110" y="60" width="28" height="28" fill="#ddd" stroke="#111" />
      <rect x="182" y="60" width="28" height="28" fill="#ddd" stroke="#111" />
      <rect x="222" y="60" width="28" height="28" fill="#ddd" stroke="#111" />
      <rect x="70" y="100" width="28" height="28" fill="#ddd" stroke="#111" />
      <rect x="110" y="100" width="28" height="28" fill="#ddd" stroke="#111" />
      <rect x="182" y="100" width="28" height="28" fill="#ddd" stroke="#111" />
      <rect x="222" y="100" width="28" height="28" fill="#ddd" stroke="#111" />
      <text x="88" y="205" fill="#555" fontFamily="monospace" fontSize="11">
        BLACKWOOD HOTEL — EXTERIOR
      </text>
    </svg>
  )
}

export default HotelIllustration
