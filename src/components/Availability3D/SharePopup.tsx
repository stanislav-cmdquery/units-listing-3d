'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import { CloseIcon, CopyIcon, FacebookLogo, GmailLogo, InstagramLogo, XLogo } from './icons'
import { useOverlay } from './useOverlay'

type Props = {
  url: string
  title: string
  onClose: () => void
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function SharePopup({ url, title, onClose }: Props) {
  const { labels } = useUnitsListingConfig()
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useOverlay(onClose)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const copy = async () => {
    if (!(await copyToClipboard(url))) return
    setCopied(true)
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(false), 2000)
  }

  // Instagram has no web share endpoint: use the native share sheet where there is one, else copy the link.
  const shareToInstagram = async () => {
    if (typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // Dismissed or unsupported: fall through to copying.
      }
    }
    await copy()
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const targets: { key: string; label: string; icon: ReactNode; href?: string; onClick?: () => void }[] = [
    {
      key: 'gmail',
      label: 'Gmail',
      icon: <GmailLogo />,
      href: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedTitle}&body=${encodedUrl}`,
    },
    { key: 'instagram', label: 'Instagram', icon: <InstagramLogo />, onClick: shareToInstagram },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: <FacebookLogo />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: 'x',
      label: 'X',
      icon: <XLogo />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ]

  return (
    <div className="ul-3d-overlay ul-3d-share-overlay" onClick={onClose}>
      <div
        className="ul-3d-share"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ul-3d-share-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ul-3d-share-header">
          <p id="ul-3d-share-title" className="ul-3d-share-title">
            {labels.shareTitle}
          </p>
          <button type="button" className="ul-3d-icon-btn" onClick={onClose} aria-label={labels.close}>
            <CloseIcon />
          </button>
        </div>

        <div className="ul-3d-share-section">
          <p className="ul-3d-field-label">{labels.shareVia}</p>
          <div className="ul-3d-share-targets">
            {targets.map((t) =>
              t.href ? (
                <a key={t.key} className="ul-3d-share-target" href={t.href} target="_blank" rel="noopener noreferrer">
                  <span className="ul-3d-share-badge">{t.icon}</span>
                  {t.label}
                </a>
              ) : (
                <button key={t.key} type="button" className="ul-3d-share-target" onClick={t.onClick}>
                  <span className="ul-3d-share-badge">{t.icon}</span>
                  {t.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="ul-3d-share-section">
          <p className="ul-3d-field-label">{labels.orCopyLink}</p>
          <button type="button" className="ul-3d-share-copy" onClick={copy}>
            <CopyIcon />
            <span className="ul-3d-link" aria-live="polite">
              {copied ? labels.linkCopied : labels.copyLinkButton}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
