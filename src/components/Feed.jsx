import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import QuestionCard from './QuestionCard'

const RAIL_MAX = 28

export default function Feed({
  scope,
  questions,
  startId,
  kept,
  onSeen,
  onVisible,
  onKeep,
  onChild,
  onDiscuss,
}) {
  const trackRef = useRef(null)
  const cards = useRef(new Map())
  const gliding = useRef(false)
  const release = useRef(0)
  const ids = useMemo(() => questions.map((question) => question.id), [questions])
  const last = ids.length - 1

  const startIndex = startId ? ids.indexOf(startId) : 0
  const [at, setAt] = useState(startIndex === -1 ? 0 : startIndex)
  const atRef = useRef(startIndex === -1 ? 0 : startIndex)

  const scrollTo = useCallback(
    (index, smooth = true) => {
      const track = trackRef.current
      const card = cards.current.get(ids[index])
      if (!track || !card) return
      // 'instant', not 'auto': a deep link must not animate past the cards in between.
      track.scrollTo({ top: card.offsetTop, behavior: smooth ? 'smooth' : 'instant' })
    },
    [ids],
  )

  // The card in view is the one the URL, the rail and the counter all agree on.
  const goTo = useCallback(
    (index, smooth = true) => {
      const next = Math.max(0, Math.min(last, index))
      if (next !== atRef.current) {
        atRef.current = next
        setAt(next)
        onVisible?.(ids[next])
      }
      if (smooth) {
        // The destination owns the URL from the start; the cards it glides past do not.
        gliding.current = true
        clearTimeout(release.current)
        release.current = setTimeout(() => {
          gliding.current = false
        }, 1200)
      }
      scrollTo(next, smooth)
    },
    [ids, last, onVisible, scrollTo],
  )

  // Which card owns the screen. Measured, not counted: cards taller than the viewport
  // would otherwise make an index guess pick the wrong one and rewrite the URL.
  const currentIndex = useCallback(() => {
    const track = trackRef.current
    if (!track) return 0
    const middle = track.scrollTop + track.clientHeight / 2
    let best = 0
    let bestDistance = Infinity
    for (let index = 0; index < ids.length; index += 1) {
      const card = cards.current.get(ids[index])
      if (!card) continue
      const center = card.offsetTop + card.offsetHeight / 2
      const distance = Math.abs(center - middle)
      if (distance < bestDistance) {
        bestDistance = distance
        best = index
      }
    }
    return best
  }, [ids])

  // Deep link: land straight on the shared question, no animation.
  useEffect(() => {
    if (!startId) return
    const index = ids.indexOf(startId)
    if (index === -1) return
    goTo(index, false)
  }, [startId, ids, goTo])

  // Watching = reading: anything filling the screen counts as visited.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onSeen(entry.target.dataset.id)
        }
      },
      { root: track, threshold: 0.55 },
    )
    for (const id of ids) {
      const card = cards.current.get(id)
      if (card) observer.observe(card)
    }
    return () => observer.disconnect()
  }, [ids, onSeen])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (gliding.current) return
        const index = currentIndex()
        if (index === atRef.current) return
        atRef.current = index
        setAt(index)
        onVisible?.(ids[index])
      })
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(release.current)
      track.removeEventListener('scroll', onScroll)
    }
  }, [currentIndex, ids, onVisible])

  useEffect(() => {
    const isTyping = (target) =>
      target instanceof HTMLElement &&
      (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')

    const onKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      if (event.defaultPrevented) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault()
        goTo(currentIndex() + 1)
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
        goTo(currentIndex() - 1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        goTo(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        goTo(last)
      } else {
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIndex, goTo, last])

  return (
    <div className="feed-wrap">
      <div className="feed" ref={trackRef}>
        {questions.map((question) => (
          <div
            className="feed-slot"
            key={question.id}
            data-id={question.id}
            ref={(node) => {
              if (node) cards.current.set(question.id, node)
              else cards.current.delete(question.id)
            }}
          >
            <QuestionCard
              question={question}
              scope={scope}
              variant="slide"
              kept={kept.includes(question.id)}
              onKeep={onKeep}
              onChild={onChild}
              onDiscuss={onDiscuss}
            />
          </div>
        ))}
      </div>

      <div className="arrows">
        <button
          type="button"
          className="arrow"
          disabled={at === 0}
          onClick={() => goTo(at - 1)}
          aria-label="Previous question"
          title="Previous question"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 14.5 12 8.5l6 6" />
          </svg>
        </button>
        <button
          type="button"
          className="arrow"
          disabled={at >= last}
          onClick={() => goTo(at + 1)}
          aria-label="Next question"
          title="Next question"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9.5 12 15.5l6-6" />
          </svg>
        </button>
      </div>

      {ids.length > 1 && ids.length <= RAIL_MAX ? (
        <nav className="rail" aria-label="Questions in this feed">
          {ids.map((id, index) => (
            <button
              key={id}
              type="button"
              className={index === at ? 'rail-dot on' : 'rail-dot'}
              aria-label={`Go to question ${index + 1}`}
              aria-current={index === at}
              onClick={() => goTo(index)}
            />
          ))}
        </nav>
      ) : null}
    </div>
  )
}
