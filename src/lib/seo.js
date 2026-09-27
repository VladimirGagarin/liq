import { childrenOf, parentIdOf } from '../data/legacy.js'
import { getChildName, getParentName } from '../data/tree.js'
import { questionPath, withBase } from '../site.config.js'

export const SITE_NAME = 'L\\IQ'
export const SITE_TITLE = 'L\\IQ · Life and its questions'
export const SITE_DESCRIPTION =
  'Ordinary-life situations with one real idea hidden inside each one. Argue it, calculate it, imagine it. Filed under twelve main topics and their subtopics, from philosophy and probability to biology, law and aesthetics.'
export const OG_IMAGE = '/og.png'

const JSONLD_ID = 'liq-jsonld'

function clip(text, max) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

// These take a bare origin — no base path — because withBase adds it. The prerenderer
// passes ORIGIN, the running app passes window.location.origin, and both land on the
// same absolute URL that the prerendered tags already carry.
export function siteMeta(origin) {
  return { title: SITE_TITLE, description: SITE_DESCRIPTION, url: `${origin}${withBase('/')}` }
}

export function questionMeta(question, canonical) {
  const topic = getParentName(parentIdOf(question))
  const tags = childrenOf(question).map(getChildName)
  return {
    topic,
    tags,
    title: `${clip(question.question, 58)} · ${topic} · ${SITE_NAME}`,
    description: `${topic}, tagged ${tags.join(', ').toLowerCase()}. One situation, one real idea, no one answer. Argue it, calculate it, imagine it.`,
    url: canonical,
  }
}

export function canonicalFor(question, origin) {
  return `${origin}${withBase(question ? questionPath(question.id) : '/')}`
}

export function siteJsonLd(url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
    description: SITE_DESCRIPTION,
  }
}

export function questionJsonLd(question, url) {
  const discussion = question.discussion ?? []
  const isAccepted = (entry) => typeof entry === 'object' && entry !== null && entry.accepted
  return {
    '@context': 'https://schema.org',
    '@type': 'Question',
    name: question.question,
    text: question.question,
    url,
    answerCount: discussion.length,
    acceptedAnswer: discussion.filter((entry) => typeof entry === 'string' || isAccepted(entry)),
    suggestedAnswer: discussion.filter((entry) => !(typeof entry === 'string' || isAccepted(entry))),
    category: getParentName(parentIdOf(question)),
    keywords: childrenOf(question).map(getChildName).join(', '),
  }
}

function setMeta(attribute, name, content) {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function setStructuredData(data) {
  const existing = document.getElementById(JSONLD_ID)
  if (!data) {
    existing?.remove()
    return
  }
  const script = existing ?? document.createElement('script')
  script.type = 'application/ld+json'
  script.id = JSONLD_ID
  script.textContent = JSON.stringify(data)
  if (!existing) document.head.appendChild(script)
}

export function applyPageMeta(question) {
  const origin = window.location.origin
  const canonical = canonicalFor(question, origin)
  const image = `${origin}${withBase(OG_IMAGE)}`
  const isQuestion = Boolean(question)
  const { title, description } = isQuestion ? questionMeta(question, canonical) : siteMeta(origin)

  document.title = title
  for (const [property, content] of [
    ['og:title', title],
    ['og:description', description],
    ['og:url', canonical],
    ['og:type', isQuestion ? 'article' : 'website'],
    ['og:image', image],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
  ]) {
    setMeta('property', property, content)
  }
  for (const [name, content] of [
    ['description', description],
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', title],
    ['twitter:description', description],
    ['twitter:image', image],
  ]) {
    setMeta('name', name, content)
  }
  setCanonical(canonical)
  setStructuredData(isQuestion ? questionJsonLd(question, canonical) : siteJsonLd(canonical))
}
