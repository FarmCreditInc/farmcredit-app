"use client"

import { useState } from "react"

interface PartnerLogoProps {
  src: string
  alt: string
  fallback?: string
  className?: string
}

export function PartnerLogo({ src, alt, fallback, className }: PartnerLogoProps) {
  const [imgSrc, setImgSrc] = useState(src)

  const handleError = () => {
    // If image fails to load, use fallback or generate one
    setImgSrc(
      fallback || `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random&color=fff&size=128`,
    )
  }

  return <img src={imgSrc || "/placeholder.svg"} alt={alt} className={className} onError={handleError} />
}
