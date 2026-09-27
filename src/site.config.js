// Set these before deploying. SITE_URL is the public origin, BASE_PATH is the path the
// site is served from — the two are only ever configured together.
//
//   GitHub Pages project site: 'https://vladimirgagarin.github.io/liq'
//   Custom domain:             'https://liq.example.com'
//
// SITE_URL drives build-time absolute URLs (sitemap.xml, canonical tags, og:image).
// BASE_PATH drives the Vite base and the prefix on every in-app link. Deriving the base
// from the origin is what keeps a subpath deploy from serving 404s on every asset.
export const SITE_URL = 'https://vladimirgagarin.github.io/liq'

// '/liq' on a Pages project site, '' at a root domain.
export const BASE_PATH = new URL(SITE_URL).pathname.replace(/\/+$/, '')

// The origin with the base path taken back off, for helpers that add the base themselves.
export const ORIGIN = new URL(SITE_URL).origin

export function questionPath(id) {
  return `/question/${id}/`
}

/** Prefix a root-relative path with the base, for links and history entries. */
export function withBase(path = '/') {
  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`
}

/** The inverse, so a pathname read off window.location can be matched against a route. */
export function stripBase(pathname) {
  if (!BASE_PATH) return pathname
  if (pathname === BASE_PATH) return '/'
  return pathname.startsWith(`${BASE_PATH}/`) ? pathname.slice(BASE_PATH.length) : pathname
}

export function absolute(path = '/') {
  return `${SITE_URL.replace(/\/$/, '')}${path}`
}
