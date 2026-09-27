function canUseStorage() {
  try {
    const probe = '__liq_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export function readList(key) {
  if (!canUseStorage()) return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((value) => typeof value === 'string')
  } catch {
    return []
  }
}

export function writeList(key, values) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(key, JSON.stringify([...values]))
  } catch {
    return
  }
}

export const KEPT_KEY = 'liq.kept'
export const SEEN_KEY = 'liq.seen'
