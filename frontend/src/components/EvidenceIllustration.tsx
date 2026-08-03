import { resolveEvidenceAsset } from '../assets/evidenceCatalog'
import './EvidenceIllustration.css'

type EvidenceIllustrationProps = {
  filename?: string | null
}

function EvidenceIllustration({ filename }: EvidenceIllustrationProps) {
  const asset = resolveEvidenceAsset(filename)

  return (
    <img
      className="evidence-illustration"
      src={asset.src}
      alt={asset.alt}
      width={320}
      height={220}
      loading="lazy"
      decoding="async"
    />
  )
}

export default EvidenceIllustration
