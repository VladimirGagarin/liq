import TopicIcon from './TopicIcon'

export default function ChildList({ parent, counts, onOpen, onAll, onBack }) {
  const total = counts[parent.id] ?? 0

  return (
    <section className="branch" style={{ '--hue': parent.hue }}>
      <header className="branch-head">
        <button type="button" className="btn ghost branch-back" onClick={onBack}>
          All topics
        </button>
        <span className="branch-title">
          <TopicIcon id={parent.id} size={17} />
          {parent.name}
        </span>
        <span className="branch-sub">
          {total} question{total === 1 ? '' : 's'} in {parent.children.length} subtopics
        </span>
        <button
          type="button"
          className="btn solid branch-all"
          disabled={total === 0}
          onClick={onAll}
        >
          Start anywhere in {parent.name}
        </button>
      </header>

      <ul className="branch-list">
        {parent.children.map((child) => {
          const count = counts[child.id] ?? 0
          return (
            <li key={child.id}>
              <button
                type="button"
                className="branch-item"
                disabled={count === 0}
                onClick={() => onOpen(child.id)}
              >
                <span className="branch-name">{child.name}</span>
                <span className="branch-n">{count}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
