import { useEffect, useRef, useState } from 'react'
import { shareUrl } from '../lib/url'
import { SITE_NAME, SITE_TITLE } from '../lib/seo'
import { Act } from './ActionBar'

const RESET_MS = 1800

export default function ShareButton({ question }) {
  const [label, setLabel] = useState('Share')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const flash = (text) => {
    setLabel(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setLabel('Share'), RESET_MS)
  }

  const onClick = async () => {
    const url = shareUrl(question.id)
    if (navigator.share) {
      try {
        await navigator.share({ title: SITE_TITLE, text: question.question, url })
      } catch {
        return
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      flash('Copied')
    } catch {
      flash('Failed')
    }
  }

  return (
    <Act
      icon="share"
      label={label}
      onClick={onClick}
      title={`Share this ${SITE_NAME} question`}
    />
  )
}
