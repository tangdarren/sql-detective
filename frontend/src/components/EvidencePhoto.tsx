import type { ReactNode } from 'react'
import './EvidencePhoto.css'

type EvidencePhotoProps = {
  caption: string
  children: ReactNode
}

function EvidencePhoto({ caption, children }: EvidencePhotoProps) {
  return (
    <figure className="evidence-photo">
      <div className="evidence-photo__frame">{children}</div>
      <figcaption className="evidence-photo__caption">{caption}</figcaption>
    </figure>
  )
}

export default EvidencePhoto
