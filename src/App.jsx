import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getChild, getHueForParent, getParent, getParentName, getParents } from './data/tree'
import {
  ALL_QUESTIONS,
  getCountByChild,
  getCountByParent,
  getParentId,
  getQuestionsForScope,
  pickQuestion,
  shuffle,
} from './lib/bank'
import { KEPT_KEY, SEEN_KEY, readList, writeList } from './lib/storage'
import { getQuestionById, readLocation, writeLocation } from './lib/url'
import { applyPageMeta } from './lib/seo'
import ChildList from './components/ChildList'
import DiscussionOverlay from './components/DiscussionOverlay'
import Feed from './components/Feed'
import QuestionCard from './components/QuestionCard'
import TopicGrid from './components/TopicGrid'
import './App.css'

const QUESTION_BY_ID = new Map(ALL_QUESTIONS.map((question) => [question.id, question]))

function feedFor(kind, key) {
  const questions = getQuestionsForScope(kind, key)
  return questions.length > 0 ? { kind, key, questions, nonce: 0 } : null
}

// Every landing reshuffles, the way a feed should: the question you asked for still
// leads, everything else changes order around it.
function ordered(feed, leadId = null) {
  const rest = shuffle(feed.questions.filter((question) => question.id !== leadId))
  const lead = leadId ? QUESTION_BY_ID.get(leadId) : null
  const questions = lead ? [lead, ...rest] : rest
  return questions.length > 0 ? { ...feed, questions, nonce: feed.nonce + 1 } : null
}

function feedForQuestion(id) {
  const question = QUESTION_BY_ID.get(id)
  if (!question) return null
  return feedFor('parent', getParentId(question))
}

function scopeFor(kind, key) {
  if (kind === 'child') {
    const child = getChild(key)
    const parent = getParent(child?.parent)
    return {
      name: `${parent?.name ?? 'Mixed'} · ${child?.name ?? 'Mixed'}`,
      hue: child?.hue ?? 268,
      icon: parent?.id ?? null,
    }
  }
  const parent = getParent(key)
  return { name: getParentName(key), hue: getHueForParent(key), icon: parent?.id ?? null }
}

function bootFrom(location) {
  const question = getQuestionById(location.questionId)
  if (question) {
    const feed = feedForQuestion(question.id)
    const orderedFeed = feed ? ordered(feed, question.id) : null
    if (orderedFeed) {
      return {
        screen: 'feed',
        parent: null,
        feed: orderedFeed,
        visible: orderedFeed.questions[0].id,
        startId: orderedFeed.questions[0].id,
      }
    }
  }
  if (getParent(location.browse)) {
    return { screen: 'browse', parent: location.browse, feed: null, visible: null, startId: null }
  }
  if (location.view === 'kept') {
    return { screen: 'kept', parent: null, feed: null, visible: null, startId: null }
  }
  return { screen: 'home', parent: null, feed: null, visible: null, startId: null }
}

export default function App() {
  const boot = useMemo(() => bootFrom(readLocation()), [])

  const [screen, setScreen] = useState(boot.screen)
  const [parent, setParent] = useState(boot.parent)
  const [feed, setFeed] = useState(boot.feed)
  const [visible, setVisible] = useState(boot.visible)
  const [startId, setStartId] = useState(boot.startId)
  const [visited, setVisited] = useState(() => {
    const list = readList(SEEN_KEY)
    const first = boot.visible
    return first && !list.includes(first) ? [...list, first] : list
  })
  const [kept, setKept] = useState(() => readList(KEPT_KEY))
  const [discussing, setDiscussing] = useState(null)

  const counts = useMemo(() => getCountByParent(), [])
  const childCounts = useMemo(() => getCountByChild(), [])
  const skipSync = useRef(false)
  const prevScreen = useRef(boot.screen)

  const seenByParent = useMemo(() => {
    const tally = {}
    for (const id of visited) {
      const question = QUESTION_BY_ID.get(id)
      if (!question) continue
      const key = getParentId(question)
      if (key) tally[key] = (tally[key] ?? 0) + 1
    }
    return tally
  }, [visited])

  useEffect(() => {
    writeList(SEEN_KEY, visited)
  }, [visited])

  useEffect(() => {
    writeList(KEPT_KEY, kept)
  }, [kept])

  const markVisited = useCallback((id) => {
    if (!id) return
    setVisited((existing) => (existing.includes(id) ? existing : [...existing, id]))
  }, [])

  const goHome = useCallback(() => {
    setScreen('home')
    setParent(null)
    setFeed(null)
    setVisible(null)
    setStartId(null)
  }, [])

  const browseParent = useCallback((id) => {
    setParent(id)
    setFeed(null)
    setVisible(null)
    setStartId(null)
    setScreen('browse')
  }, [])

  const openFeed = useCallback((next, start = null) => {
    const feed = next ? ordered(next, start) : null
    if (!feed) return
    setParent(null)
    setFeed(feed)
    setStartId(feed.questions[0].id)
    setVisible(feed.questions[0].id)
    setScreen('feed')
  }, [])

  const openScope = useCallback(
    (kind, key) => openFeed(feedFor(kind, key)),
    [openFeed],
  )

  const openQuestion = useCallback(
    (id) => openFeed(feedForQuestion(id), id),
    [openFeed],
  )

  const surprise = useCallback(() => {
    const question = pickQuestion(visited)
    openQuestion(question.id)
  }, [openQuestion, visited])

  const toggleKeep = useCallback((id) => {
    setKept((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }, [])

  const openDiscussion = useCallback((question) => setDiscussing(question.id), [])
  const closeDiscussion = useCallback(() => setDiscussing(null), [])

  const current = QUESTION_BY_ID.get(visible) ?? null

  const applyLocation = useCallback(
    (location) => {
      const question = getQuestionById(location.questionId)
      if (question && feedForQuestion(question.id)) {
        markVisited(question.id)
        openFeed(feedForQuestion(question.id), question.id)
        return
      }
      setFeed(null)
      setStartId(null)
      setVisible(null)
      if (getParent(location.browse)) {
        setParent(location.browse)
        setScreen('browse')
        return
      }
      setParent(null)
      setScreen(location.view === 'kept' ? 'kept' : 'home')
    },
    [markVisited, openFeed],
  )

  useEffect(() => {
    if (skipSync.current) {
      skipSync.current = false
      prevScreen.current = screen
      return
    }
    const entering = screen === 'feed' && prevScreen.current !== 'feed'
    prevScreen.current = screen
    writeLocation({ screen, parent, question: current }, { push: entering })
  }, [screen, parent, current])

  useEffect(() => {
    applyPageMeta(current)
  }, [current])

  useEffect(() => {
    const onPop = () => {
      skipSync.current = true
      applyLocation(readLocation())
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [applyLocation])

  const branch = parent ? getParent(parent) : null
  const position =
    (feed?.questions.findIndex((question) => question.id === visible) ?? -1) + 1 || 1
  const thread = QUESTION_BY_ID.get(discussing) ?? null
  const threadHue = thread ? getHueForParent(getParentId(thread)) : 268

  return (
    <>
      <div className={screen === 'feed' ? 'shell shell-feed' : 'shell'}>
      <header className="bar">
        <button type="button" className="wordmark" onClick={goHome}>
          L<em>\</em>IQ
        </button>
        <nav className="bar-nav">
          <button
            type="button"
            className={screen === 'home' ? 'chip on' : 'chip'}
            onClick={goHome}
          >
            Topics
          </button>
          <button
            type="button"
            className={screen === 'kept' ? 'chip on' : 'chip'}
            onClick={() => {
              setParent(null)
              setFeed(null)
              setStartId(null)
              setScreen('kept')
            }}
          >
            Kept{kept.length > 0 ? ` · ${kept.length}` : ''}
          </button>
        </nav>
      </header>

      <main className="main">
        {screen === 'home' ? (
          <Home
            parents={getParents()}
            counts={counts}
            seenByParent={seenByParent}
            onOpenParent={browseParent}
            onSurprise={surprise}
          />
        ) : null}

        {screen === 'browse' && branch ? (
          <ChildList
            parent={branch}
            counts={childCounts}
            onOpen={(childId) => openScope('child', childId)}
            onAll={() => openScope('parent', branch.id)}
            onBack={goHome}
          />
        ) : null}

        {screen === 'feed' && feed ? (
          <>
            <div
              className="feed-bar"
              style={{
                '--hue': scopeFor(feed.kind, feed.key).hue,
                '--at': `${(position / feed.questions.length) * 100}%`,
              }}
            >
              <span className="feed-name">{scopeFor(feed.kind, feed.key).name}</span>
              <span className="feed-count">
                {position} / {feed.questions.length}
              </span>
              <span className="feed-progress" aria-hidden="true">
                <span />
              </span>
            </div>
            <Feed
              key={`${feed.kind}-${feed.key}-${feed.nonce}`}
              scope={scopeFor(feed.kind, feed.key)}
              questions={feed.questions}
              startId={startId}
              kept={kept}
              onSeen={markVisited}
              onVisible={setVisible}
              onKeep={toggleKeep}
              onChild={(childId) => openScope('child', childId)}
              onDiscuss={openDiscussion}
            />
          </>
        ) : null}

        {screen === 'kept' ? (
          <Kept
            kept={kept}
            onOpen={openQuestion}
            onDiscuss={openDiscussion}
            onKeep={toggleKeep}
            onHome={goHome}
          />
        ) : null}
      </main>

        <footer className="foot">
          <span>Life And Its Question</span>
          <span className="foot-sep" aria-hidden="true">
            |
          </span>
          <span>{new Date().getFullYear()}</span>
        </footer>
      </div>

      <DiscussionOverlay question={thread} hue={threadHue} onClose={closeDiscussion} />
    </>
  )
}

function Home({ parents, counts, seenByParent, onOpenParent, onSurprise }) {
  return (
    <div className="home">
      <section className="hero">
        <span className="hero-mark" aria-hidden="true">
          ?
        </span>
        <h1 className="hero-title">Life and its questions</h1>
        <p className="hero-sub">
          One question at a time, with no one answer. Sit with it, argue it, calculate it — then see
          what everyone else thinks.
        </p>
        <button type="button" className="btn solid" onClick={onSurprise}>
          Ask me something
        </button>
      </section>

      <TopicGrid
        parents={parents}
        counts={counts}
        seenByParent={seenByParent}
        onOpen={onOpenParent}
      />
    </div>
  )
}

function Kept({ kept, onOpen, onDiscuss, onKeep, onHome }) {
  const items = kept.map((id) => QUESTION_BY_ID.get(id)).filter(Boolean)

  if (items.length === 0) {
    return (
      <section className="empty">
        <span className="empty-mark" aria-hidden="true">
          ?
        </span>
        <h1 className="empty-title">Nothing kept yet</h1>
        <p className="empty-sub">
          Open a topic and press Keep on the questions you want to live with for a while.
        </p>
        <button type="button" className="btn solid" onClick={onHome}>
          Choose a topic
        </button>
      </section>
    )
  }

  return (
    <section className="kept">
      <h1 className="kept-title">Kept</h1>
      <div className="kept-list">
        {items.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            scope={scopeFor('parent', getParentId(question))}
            variant="panel"
            kept
            onOpen={onOpen}
            onDiscuss={onDiscuss}
            onKeep={onKeep}
          />
        ))}
      </div>
    </section>
  )
}
