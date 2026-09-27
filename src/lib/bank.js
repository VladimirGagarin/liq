import questions from '../data/questions.json'
import { childrenOf, parentIdOf } from '../data/legacy'
import { hasChild, hasParent } from '../data/tree'

export const ALL_QUESTIONS = questions

const PARENT_BY_QUESTION = new Map(ALL_QUESTIONS.map((question) => [question.id, parentIdOf(question)]))
const CHILDREN_BY_QUESTION = new Map(
  ALL_QUESTIONS.map((question) => [question.id, childrenOf(question)]),
)

export function getQuestion(id) {
  return questions.find((question) => question.id === id) ?? null
}

export function getParentId(question) {
  return PARENT_BY_QUESTION.get(question.id) ?? null
}

export function getChildren(question) {
  return CHILDREN_BY_QUESTION.get(question.id) ?? []
}

function inScope(question, kind, key) {
  if (kind === 'child') return getChildren(question).includes(key)
  return getParentId(question) === key
}

export function getQuestionsForScope(kind, key) {
  return questions.filter((question) => inScope(question, kind, key))
}

export function getCountByParent() {
  return questions.reduce((counts, question) => {
    const id = getParentId(question)
    if (id) counts[id] = (counts[id] ?? 0) + 1
    return counts
  }, {})
}

export function getCountByChild() {
  return questions.reduce((counts, question) => {
    for (const child of getChildren(question)) {
      counts[child] = (counts[child] ?? 0) + 1
    }
    return counts
  }, {})
}

export function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildQueue(kind, key) {
  return shuffle(getQuestionsForScope(kind, key).map((question) => question.id))
}

export function pickQuestion(excludeIds = []) {
  const excluded = new Set(excludeIds)
  const pool = questions.filter((question) => !excluded.has(question.id))
  const source = pool.length > 0 ? pool : questions
  return source[Math.floor(Math.random() * source.length)]
}

if (import.meta.env.DEV) {
  const seen = new Set()
  for (const question of questions) {
    if (seen.has(question.id)) {
      console.warn(`[liq] duplicate question id: ${question.id}`)
    }
    seen.add(question.id)
    const parent = getParentId(question)
    if (!parent) {
      console.warn(`[liq] ${question.id} has no main topic`)
    } else if (!hasParent(parent)) {
      console.warn(`[liq] ${question.id} has unknown main topic "${parent}"`)
    }
    if (!Array.isArray(question.discussion)) {
      console.warn(`[liq] ${question.id} is missing a discussion array`)
    }
    const children = getChildren(question)
    if (children.length === 0) {
      console.warn(`[liq] ${question.id} has no subtopics`)
    }
    for (const child of children) {
      if (!hasChild(child)) console.warn(`[liq] ${question.id} has unknown subtopic "${child}"`)
    }
  }
}
