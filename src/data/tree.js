// The single taxonomy: 12 main topics, each with the subtopics questions hang off.
// A question has exactly one parent and any number of children inside it.
const GROUPS = [
  {
    id: 'mind',
    numeral: 'I',
    name: 'Mind & Human Nature',
    hue: 268,
    children: ['Philosophy', 'Psychology', 'Neuroscience', 'Sociology', 'Ethics', 'Identity'],
  },
  {
    id: 'reasoning',
    numeral: 'II',
    name: 'Mathematics & Reasoning',
    hue: 224,
    children: ['Mathematics', 'Geometry', 'Probability', 'Statistics', 'Logic', 'Game Theory'],
  },
  {
    id: 'universe',
    numeral: 'III',
    name: 'Physical Universe',
    hue: 172,
    children: ['Physics', 'Thermodynamics', 'Chemistry', 'Time', 'Cosmology'],
  },
  {
    id: 'life',
    numeral: 'IV',
    name: 'Life & Information',
    hue: 140,
    children: ['Biology', 'Computer Science', 'Information Theory'],
  },
  {
    id: 'language',
    numeral: 'V',
    name: 'Language & Society',
    hue: 34,
    children: ['Linguistics', 'Law'],
  },
  {
    id: 'beauty',
    numeral: 'VI',
    name: 'Art & Beauty',
    hue: 344,
    children: ['Art / Aesthetics'],
  },
  {
    id: 'career',
    numeral: 'VII',
    name: 'Work & Career',
    hue: 52,
    children: ['Work', 'Leadership', 'Teamwork', 'Careers', 'Workplace'],
  },
  {
    id: 'economy',
    numeral: 'VIII',
    name: 'Money & Economy',
    hue: 92,
    children: ['Money', 'Business', 'Economics', 'Trade', 'Wealth'],
  },
  {
    id: 'relationships',
    numeral: 'IX',
    name: 'Relationships',
    hue: 314,
    children: ['Friendship', 'Family', 'Love', 'Trust', 'Communication'],
  },
  {
    id: 'everyday',
    numeral: 'X',
    name: 'Everyday Life',
    hue: 8,
    children: ['Food', 'Home', 'Travel', 'Decisions', 'Habits', 'Society'],
  },
  {
    id: 'technology',
    numeral: 'XI',
    name: 'Technology',
    hue: 198,
    children: ['Internet', 'Artificial Intelligence', 'Social Media', 'Privacy', 'Digital Life'],
  },
  {
    id: 'culture',
    numeral: 'XII',
    name: 'Entertainment & Culture',
    hue: 288,
    children: ['Music', 'Film', 'Games', 'Sports', 'Television', 'Popular Culture'],
  },
]

export function childId(name) {
  return name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
}

const PARENTS = GROUPS.map((group) => ({
  ...group,
  children: group.children.map((name) => ({ id: childId(name), name })),
}))

const PARENT_BY_ID = new Map(PARENTS.map((parent) => [parent.id, parent]))
const CHILD_BY_ID = new Map(
  PARENTS.flatMap((parent) =>
    parent.children.map((child) => [child.id, { ...child, parent: parent.id, hue: parent.hue }]),
  ),
)

export function getParents() {
  return PARENTS
}

export function getParent(id) {
  return PARENT_BY_ID.get(id) ?? null
}

export function hasParent(id) {
  return PARENT_BY_ID.has(id)
}

export function getParentName(id) {
  return PARENT_BY_ID.get(id)?.name ?? 'Mixed'
}

export function getHueForParent(id) {
  return PARENT_BY_ID.get(id)?.hue ?? 268
}

export function getChild(id) {
  return CHILD_BY_ID.get(id) ?? null
}

export function hasChild(id) {
  return CHILD_BY_ID.has(id)
}

export function getChildName(id) {
  return CHILD_BY_ID.get(id)?.name ?? 'Mixed'
}

export function getParentOfChild(id) {
  return CHILD_BY_ID.get(id)?.parent ?? null
}

export function getHueForChild(id) {
  return CHILD_BY_ID.get(id)?.hue ?? 268
}

export function getAllChildren() {
  return [...CHILD_BY_ID.values()]
}
