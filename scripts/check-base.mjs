import { withBase, stripBase, ORIGIN, questionPath } from '../src/site.config.js'

// Copied verbatim from src/lib/url.js.
const PATH_QUESTION = /^\/question\/(liq-\d+)\/?$/

const pass = (label, got, want) => {
  const ok = got === want
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(46)} ${got}`)
  if (!ok) console.log(`      expected ${want}`)
}

console.log('readLocation: pathname -> question id')
for (const [pathname, want] of [
  ['/liq/question/liq-0001/', 'liq-0001'],
  ['/liq/question/liq-0042', 'liq-0042'],
  ['/liq/question/nope/', null],
  ['/liq/question/liq-0001/extra/', null],
  ['/liq/', null],
  ['/', null],
]) {
  pass(pathname, String(PATH_QUESTION.exec(stripBase(pathname))?.[1] ?? null), String(want))
}

console.log('\nbuildSearch: every entry is absolute and base-prefixed')
pass('feed', withBase(questionPath('liq-0007')), '/liq/question/liq-0007/')
pass('kept', `${withBase('/')}?view=kept`, '/liq/?view=kept')
pass('browse', `${withBase('/')}?browse=mind`, '/liq/?browse=mind')
pass('home', withBase('/'), '/liq/')
pass('share', `${ORIGIN}${withBase(questionPath('liq-0007'))}`, 'https://vladimirgagarin.github.io/liq/question/liq-0007/')

console.log('\nno URL can keep a question in the path while naming another screen')
pass('kept is not under a question', withBase('/').startsWith('/liq/question/'), false)

console.log('\nroot-domain fallback (SITE_URL without a subpath)')
const root = 'https://liq.example.com'
pass('root withBase', `${new URL(root).pathname.replace(/\/+$/, '')}/`, '/')
pass('root stripBase', new URL(root).pathname.replace(/\/+$/, ''), '')
