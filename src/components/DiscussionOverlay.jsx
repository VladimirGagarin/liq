import { useEffect, useRef } from 'react'

const NEEDS_SERVER = 'Replies open when the server does'

function text(entry) {
  if (typeof entry === 'string') return { body: entry, author: null, at: null }
  return {
    body: entry?.text ?? entry?.body ?? '',
    author: entry?.author ?? entry?.name ?? null,
    at: entry?.at ?? entry?.created ?? null,
  }
}

function when(stamp) {
  if (!stamp) return null
  const date = new Date(stamp)
  if (Number.isNaN(date.getTime())) return String(stamp)
  const days = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * The thread never lives inside the card. Desktop gets a side panel, small screens
 * get a drawer that rises from the bottom edge — same component, same data.
 */
export default function DiscussionOverlay({ question, hue = 268, onClose }) {
  const panel = useRef(null)

  useEffect(() => {
    if (!question) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
      }
    }
    window.addEventListener('keydown', onKey)
    panel.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, question])

  if (!question) return null
  const entries = question.discussion ?? []

  return (
    <div className="ovl" style={{ '--hue': hue }}>
      <button type="button" className="ovl-scrim" onClick={onClose} aria-label="Close discussion" />
      <aside
        className="ovl-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Discussion"
        tabIndex={-1}
        ref={panel}
      >
        <div className="ovl-grip" aria-hidden="true" />

        <header className="ovl-head">
          <h2 className="ovl-title">
            Discussion
            <span className="ovl-n">{entries.length}</span>
          </h2>
          <button type="button" className="ovl-x" onClick={onClose} aria-label="Close discussion">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <p className="ovl-quote">{question.question}</p>

        <div className="ovl-body">
          {entries.length > 0 ? (
            <ul className="ovl-list">
              {entries.map((entry, index) => {
                const item = text(entry)
                return (
                  <li className="ovl-item" key={item.at ?? index}>
                    <span className="ovl-avatar" aria-hidden="true">
                      {(item.author ?? '?').slice(0, 1).toUpperCase()}
                    </span>
                    <div className="ovl-item-body">
                      <p className="ovl-meta">
                        <span className="ovl-author">{item.author ?? 'Someone'}</span>
                        {when(item.at) ? <span className="ovl-when">{when(item.at)}</span> : null}
                      </p>
                      <p className="ovl-text">{item.body}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="ovl-empty">
              <span aria-hidden="true">?</span> Nobody has argued this one yet. First response
              wins the thread.
            </p>
          )}
        </div>

        <div className="ovl-foot">
          <div className="composer">
            <input
              type="text"
              className="composer-field"
              placeholder="Add your answer to the thread…"
              disabled
              title={NEEDS_SERVER}
              aria-label="Add your answer to the discussion"
            />
            <button type="button" className="btn solid composer-send" disabled title={NEEDS_SERVER}>
              Post
            </button>
          </div>
          <p className="composer-note">{NEEDS_SERVER}</p>
        </div>
      </aside>
    </div>
  )
}
