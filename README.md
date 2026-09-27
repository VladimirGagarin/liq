# L\IQ

**Life and its questions.**

One question at a time, with no one answer. Sit with it, argue it, calculate it — then see what
everyone else thinks.

L\IQ is a static React site that hands you a single question, drawn from a plain situation you
already recognise, with one real idea hiding inside it. There is no answer key. There is a topic,
a set of subtopics, a place to keep the ones worth living with, and a thread to argue in.

---

## The idea

Most "question" sites want you to guess what the asker meant. These don't. Each question is an
ordinary scene — two drunk drivers, a duplicate of you waking up, a train you keep taking on
time — with a hard idea threaded through it. Philosophy, probability, law, thermodynamics, art.
You are meant to have an opinion and be slightly unsettled by it.

Nothing is scored. Nothing is finished. The unit of the site is one question, and the unit of
progress is having read it.

## The twelve topics

Questions hang off one main topic and any number of subtopics.

| | Topic | Subtopics |
|---|---|---|
| I | Mind & Human Nature | Philosophy · Psychology · Neuroscience · Sociology · Ethics · Identity |
| II | Mathematics & Reasoning | Mathematics · Geometry · Probability · Statistics · Logic · Game Theory |
| III | Physical Universe | Physics · Thermodynamics · Chemistry · Time · Cosmology |
| IV | Life & Information | Biology · Computer Science · Information Theory |
| V | Language & Society | Linguistics · Law |
| VI | Art & Beauty | Art / Aesthetics |
| VII | Work & Career | Work · Leadership · Teamwork · Careers · Workplace |
| VIII | Money & Economy | Money · Business · Economics · Trade · Wealth |
| IX | Relationships | Friendship · Family · Love · Trust · Communication |
| X | Everyday Life | Food · Home · Travel · Decisions · Habits · Society |
| XI | Technology | Internet · Artificial Intelligence · Social Media · Privacy · Digital Life |
| XII | Entertainment & Culture | Music · Film · Games · Sports · Television · Popular Culture |

Each topic carries its own hue, and that colour follows you into the feed, the cards, the progress
bar and the discussion panel.

## What it does

- **Ask me something** — jumps straight into a feed, leading with a question you have not seen.
- **One at a time** — a swipeable feed of a single scope, with position and progress. Every landing
  reshuffles around the question you asked for, the way a feed should.
- **Browse by topic or subtopic** — twelve main topics, each opening into its subtopics with live
  counts.
- **Keep** — bookmark the questions you want to sit with. Stored in `localStorage`, no account.
- **Discuss** — a thread per question, as a side panel on desktop and a bottom drawer on small
  screens.
- **Share** — every question has a permalink at `/question/<id>/`, so a link drops the reader into
  the right feed with that question up front.
- **Seeded, not fetched** — the whole question bank ships as static JSON. No server, no database,
  no tracking.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static build into dist/, with every question page prerendered
npm run preview    # serve the built dist/ locally
npm run lint
```

Node 20+ recommended (Vite 8).

## Layout

```
src/
  App.jsx                 screens, routing-by-URL, feed state
  site.config.js          SITE_URL and path helpers
  data/
    questions.json        the question bank
    tree.js               the taxonomy: 12 topics, their subtopics, their hues
    legacy.js             TEMPORARY shim, translates the old flat `topic` shape
  lib/
    bank.js               lookups, scopes, counts, shuffling, dev-time validation
    storage.js            localStorage for kept + seen
    url.js                URL <-> screen state, the single source of truth
    seo.js                titles, canonicals, Open Graph, schema.org Question JSON-LD
  components/             TopicGrid, ChildList, Feed, QuestionCard, ActionBar,
                          DiscussionOverlay, ShareButton, TopicIcon
prerender-plugin.js       Vite plugin: prerenders one HTML file per question
scripts/make-og-image.mjs generates public/og.png
```

### State lives in the URL

The path names the question; query parameters describe the screen around it. A feed can never
end up at `/question/x/?question=x`, and every question is linkable and back-button-safe.

## Adding a question

Append to `src/data/questions.json`:

```json
{
  "id": "liq-0291",
  "topic": "science",
  "topic_tags": ["Thermodynamics", "Physics"],
  "question": "The situation, stated plainly, ending in something you cannot unsee.",
  "discussion": []
}
```

`topic` picks the main topic and `topic_tags` picks the subtopics, so one question can appear under
several of them. Then run `npm run build`. The dev server validates the bank on boot and warns about
unknown topics, missing subtopics, missing discussions and duplicate ids, so mistakes surface
immediately.

The `topic` / `topic_tags` shape is legacy. Once every question is rewritten with the tree's
`parent` + `children`, `src/data/legacy.js` can be deleted.

## Building for deploy

Set the public origin in `src/site.config.js` before building — it is used for the canonical tags,
`og:image` and the sitemap:

```js
export const SITE_URL = 'https://liq.example.com'
```

Then `npm run build` and serve `dist/` from any static host.

## Status

290 questions written and filed. 212 of them sit under **Mind & Human Nature**, which is where the
bulk of the bank lives — the subtopics there are deep, the other eleven topics are still thin and
want the same treatment. The `discussion` arrays are seeded but empty — posting needs a server, so
the overlay currently says so honestly rather than pretending.
