import { ALL_QUESTIONS } from './bank'
import { questionPath, stripBase, withBase } from '../site.config'

const QUESTION_BY_ID = new Map(ALL_QUESTIONS.map((question) => [question.id, question]))
const PATH_QUESTION = /^\/question\/(liq-\d+)\/?$/

export function getQuestionById(id) {
  return id ? (QUESTION_BY_ID.get(id) ?? null) : null
}

// The path is the only source of truth for a question. Query params describe the screen
// around it, never the question, so a feed can never end up as /question/x/?question=x.
export function readLocation({ search = window.location.search, pathname = window.location.pathname } = {}) {
  const params = new URLSearchParams(search)
  const fromPath = PATH_QUESTION.exec(stripBase(pathname))
  return {
    questionId: fromPath?.[1] ?? params.get('question'),
    view: params.get('view'),
    browse: params.get('browse'),
  }
}

// Every entry is absolute and base-prefixed. A bare "?view=kept" would resolve against
// the current path and leave the question of the feed you just left sitting underneath it.
export function buildSearch({ screen, parent, question }) {
  if (screen === 'kept') return `${withBase('/')}?view=kept`
  if (screen === 'browse' && parent) return `${withBase('/')}?browse=${encodeURIComponent(parent)}`
  if (screen === 'feed' && question) return withBase(questionPath(question.id))
  return withBase('/')
}

export function shareUrl(questionId) {
  return `${window.location.origin}${withBase(questionPath(questionId))}`
}

export function writeLocation(state, { push = false } = {}) {
  const url = `${buildSearch(state)}`
  if (push) window.history.pushState(null, '', url)
  else window.history.replaceState(null, '', url)
}
