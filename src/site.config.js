// Set this to the public origin before deploying, e.g. 'https://liq.example.com'.
// Used only for build-time absolute URLs (sitemap.xml, canonical tags, og:image).
// The running app uses window.location.origin, so an unset value is harmless locally.
export const SITE_URL = 'https://liq.example.com'

export function questionPath(id) {
  return `/question/${id}/`
}

export function absolute(path = '/') {
  return `${SITE_URL.replace(/\/$/, '')}${path}`
}
