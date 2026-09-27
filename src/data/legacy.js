import { childId } from './tree.js'

// TEMPORARY. questions.json still carries the old flat `topic` (10 values) and the old
// cross-field `topic_tags`. Until every question is rewritten with `parent` + `children`,
// these two tables translate the old shape into the tree. Delete this file once the
// migration in src/data/questions.json is done.

const LEGACY_PARENT = {
  philosophy: 'mind',
  psychology: 'mind',
  religion: 'mind',
  science: 'universe',
  mathematics: 'reasoning',
  art: 'beauty',
  history: 'everyday',
  love: 'relationships',
  work: 'career',
  technology: 'technology',
}

// Subtopics that were renamed when the tree landed.
const LEGACY_CHILD = {
  Aesthetics: 'Art / Aesthetics',
}

export function parentIdOf(question) {
  return question.parent ?? LEGACY_PARENT[question.topic] ?? null
}

export function childrenOf(question) {
  if (Array.isArray(question.children)) return question.children
  return (question.topic_tags ?? []).map((tag) => childId(LEGACY_CHILD[tag] ?? tag))
}
