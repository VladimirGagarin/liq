import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ORIGIN, absolute, questionPath } from './src/site.config.js'
import {
  OG_IMAGE,
  SITE_TITLE,
  questionJsonLd,
  questionMeta,
  siteJsonLd,
  siteMeta,
} from './src/lib/seo.js'

// Read straight from disk: src/lib/bank.js is guarded by import.meta.env.DEV, which
// does not exist inside the vite config. cwd rather than import.meta.url, because the
// config itself may be executed from a temporary bundle.
const QUESTIONS = JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', 'questions.json'), 'utf8'))

const MANAGED = [
  /<title>[\s\S]*?<\/title>/gi,
  /<link\b[^>]*rel="canonical"[^>]*>/gi,
  /<meta\b[^>]*name="description"[^>]*>/gi,
  /<meta\b[^>]*property="og:[^"]*"[^>]*>/gi,
  /<meta\b[^>]*name="twitter:[^"]*"[^>]*>/gi,
  /<script\b[^>]*id="liq-jsonld"[^>]*>[\s\S]*?<\/script>/gi,
  /<noscript>[\s\S]*?<\/noscript>/gi,
]

const escapeHtml = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const metaTags = ({ title, description, url, type }) => {
  const image = absolute(OG_IMAGE)
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="L\\IQ" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ]
  return tags.join('\n    ')
}

const NOSCRIPT_CSS = `      .fallback { max-width: 42rem; margin: 4rem auto; padding: 0 1.5rem; font: 400 1.05rem/1.6 ui-sans-serif, system-ui, sans-serif; color: #14131a; }
      .fallback p { color: #6b6873; }
      .fallback .scope { letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.75rem; }
      .fallback h1 { font-size: 1.9rem; line-height: 1.25; font-weight: 500; }
      .fallback ul { padding-left: 1.1rem; color: #6b6873; }`

const noscriptBlock = ({ scope, heading, tags, url }) => `    <noscript>
      <style>
${NOSCRIPT_CSS}
      </style>
      <div class="fallback">
        <p class="scope">${escapeHtml(scope)}</p>
        <h1>${escapeHtml(heading)}</h1>
        <p>No one answer. Argue it, calculate it, imagine it.</p>
        <p>Tagged ${escapeHtml(tags)}</p>
        <p><a href="${escapeHtml(url)}">Open this question in L\\IQ</a></p>
      </div>
    </noscript>`

function applyMeta(html, { meta, jsonLd, noscript }) {
  let out = html
  for (const pattern of MANAGED) out = out.replace(pattern, '')
  out = out.replace('</head>', `    ${metaTags(meta)}\n    <script type="application/ld+json" id="liq-jsonld">\n      ${JSON.stringify(jsonLd)}\n    </script>\n  </head>`)
  out = out.replace('<div id="root"></div>', `${noscript}\n    <div id="root"></div>`)
  return out.replace(/\n\s*\n\s*\n+/g, '\n\n')
}

const escapeXml = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')

function sitemap(questions) {
  const entries = [
    { loc: absolute('/'), priority: '1.0' },
    ...questions.map((question) => ({ loc: absolute(questionPath(question.id)), priority: '0.8' })),
  ]
  const body = entries
    .map(({ loc, priority }) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

export function prerender() {
  let outDir = 'dist'
  return {
    name: 'liq-prerender',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const root = join(process.cwd(), outDir)
      const template = readFileSync(join(root, 'index.html'), 'utf8')

      for (const question of QUESTIONS) {
        const url = absolute(questionPath(question.id))
        const meta = questionMeta(question, url)
        const html = applyMeta(template, {
          meta: { ...meta, type: 'article' },
          jsonLd: questionJsonLd(question, url),
          noscript: noscriptBlock({
            scope: `L\\IQ · ${meta.topic}`,
            heading: question.question,
            tags: meta.tags.join(' · '),
            url,
          }),
        })
        const dir = join(root, questionPath(question.id))
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), html)
      }

      const homeUrl = absolute('/')
      writeFileSync(
        join(root, 'index.html'),
        applyMeta(template, {
          // ORIGIN, not homeUrl: siteMeta adds the base path itself, and homeUrl has it already.
          meta: { ...siteMeta(ORIGIN), type: 'website' },
          jsonLd: siteJsonLd(homeUrl),
          noscript: noscriptBlock({
            scope: 'L\\IQ · Life and its questions',
            heading: SITE_TITLE,
            tags: 'Philosophy · Mathematics · Probability · Biology · Law · Computer Science · Aesthetics',
            url: homeUrl,
          }),
        }),
      )

      writeFileSync(join(root, 'sitemap.xml'), sitemap(QUESTIONS))
      writeFileSync(
        join(root, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`,
      )

      console.log(
        `  liq-prerender  ${QUESTIONS.length} question pages, sitemap.xml, robots.txt  (site url: ${absolute('/')})`,
      )
    },
  }
}
