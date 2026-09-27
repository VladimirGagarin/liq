import { getChildName, getHueForChild } from '../data/tree'
import ActionBar, { Act } from './ActionBar'
import ShareButton from './ShareButton'
import TopicIcon from './TopicIcon'

const NEEDS_SERVER = 'Comes alive when the server does'

/**
 * One question, usable anywhere: the feed slide, the kept list, a search result, a
 * future detail page. Nothing in here is feed-specific.
 *
 * variant: 'slide' fills whatever space it is given (the feed) · 'panel' is a card in
 * a list (kept) · 'tile' is a bare question with no chrome.
 */
export default function QuestionCard({
  question,
  scope,
  children,
  kept = false,
  onKeep,
  onChild,
  onOpen,
  onDiscuss,
  variant = 'slide',
  showScope = true,
  showTags = false,
}) {
  const tags = children ?? []
  const count = question.discussion?.length ?? 0

  return (
    <article
      className={`q-card q-${variant}`}
      style={{ '--hue': scope?.hue ?? 268 }}
      data-id={question.id}
    >
      {showScope ? (
        <header className="q-head">
          <span className="q-scope">
            {scope?.icon ? <TopicIcon id={scope.icon} size={15} /> : null}
            {scope?.name ?? ''}
          </span>
        </header>
      ) : null}

      <div className="q-stage">
        <span className="q-mark-big" aria-hidden="true">
          ?
        </span>

        <h1 className="q-text">
          {onOpen ? (
            <button type="button" className="q-link" onClick={() => onOpen(question)}>
              {question.question}
            </button>
          ) : (
            question.question
          )}
        </h1>

        {showTags && tags.length > 0 ? (
          <ul className="q-tags">
            {tags.map((tag) => (
              <li key={tag} style={{ '--hue': getHueForChild(tag) }}>
                <button
                  type="button"
                  className="tag"
                  onClick={() => onChild?.(tag)}
                  title={`Open every ${getChildName(tag)} question`}
                >
                  {getChildName(tag)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <footer className="q-foot">
        <ActionBar>
          <Act icon="like" label="Like" count={0} disabled title={NEEDS_SERVER} />
          <Act
            icon="discuss"
            label="Discuss"
            count={count}
            onClick={onDiscuss ? () => onDiscuss(question) : undefined}
            title="Open the discussion"
          />
          <ShareButton question={question} />
          <Act icon="remind" label="Remind" disabled title={NEEDS_SERVER} />
          <Act
            icon="keep"
            label="Keep"
            pressed={kept}
            onClick={onKeep ? () => onKeep(question.id) : undefined}
            title="Keep this question"
          />
        </ActionBar>
      </footer>
    </article>
  )
}
