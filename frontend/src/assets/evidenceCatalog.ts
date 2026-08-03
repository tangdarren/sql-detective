export type EvidenceAsset = {
  filename: string
  src: string
  alt: string
  caption: string
}

const BASE = '/assets/evidence'

export const evidenceAssets: Record<string, EvidenceAsset> = {
  'hotel-exterior.svg': {
    filename: 'hotel-exterior.svg',
    src: `${BASE}/hotel-exterior.svg`,
    alt: 'Black and white newspaper-style illustration of the Blackwood Hotel exterior',
    caption: 'Blackwood Hotel — exterior',
  },
  'empty-hallway.svg': {
    filename: 'empty-hallway.svg',
    src: `${BASE}/empty-hallway.svg`,
    alt: 'Black and white sketch of an empty hotel hallway on the fourth floor',
    caption: 'Fourth-floor hallway',
  },
  'missing-painting.svg': {
    filename: 'missing-painting.svg',
    src: `${BASE}/missing-painting.svg`,
    alt: 'Black and white sketch of an empty picture frame in Room 417 where a painting is missing',
    caption: 'Crime scene — Room 417',
  },
  'guest-registry.svg': {
    filename: 'guest-registry.svg',
    src: `${BASE}/guest-registry.svg`,
    alt: 'Black and white sketch of a hotel guest registry ledger',
    caption: 'Evidence — guest registry',
  },
  'master-key.svg': {
    filename: 'master-key.svg',
    src: `${BASE}/master-key.svg`,
    alt: 'Black and white sketch of a hotel master key and night-shift locker note',
    caption: 'Evidence — master key',
  },
  'midnight-entry.svg': {
    filename: 'midnight-entry.svg',
    src: `${BASE}/midnight-entry.svg`,
    alt: 'Black and white sketch of a security access log for Room 417 after midnight',
    caption: 'Evidence — security access log',
  },
  'suspicious-payments.svg': {
    filename: 'suspicious-payments.svg',
    src: `${BASE}/suspicious-payments.svg`,
    alt: 'Black and white sketch of a suspicious cash payment receipt',
    caption: 'Evidence — payment receipt',
  },
  'identify-thief.svg': {
    filename: 'identify-thief.svg',
    src: `${BASE}/identify-thief.svg`,
    alt: 'Black and white sketch connecting room access clues with cash payment evidence',
    caption: 'Evidence — connected clues',
  },
  'evidence-folder.svg': {
    filename: 'evidence-folder.svg',
    src: `${BASE}/evidence-folder.svg`,
    alt: 'Black and white sketch of an open case evidence folder',
    caption: 'Case 01 evidence folder',
  },
  'suspect-portraits.svg': {
    filename: 'suspect-portraits.svg',
    src: `${BASE}/suspect-portraits.svg`,
    alt: 'Black and white fictional silhouette sketches of anonymous hotel guests and staff',
    caption: 'Suspect sketches',
  },
  'final-thief-reveal.svg': {
    filename: 'final-thief-reveal.svg',
    src: `${BASE}/final-thief-reveal.svg`,
    alt: 'Black and white final suspect sketch labeled Julian Pike, Room 410',
    caption: 'Final suspect — Room 410',
  },
}

export function resolveEvidenceAsset(filename?: string | null): EvidenceAsset {
  if (filename && evidenceAssets[filename]) {
    return evidenceAssets[filename]
  }
  return evidenceAssets['guest-registry.svg']
}
