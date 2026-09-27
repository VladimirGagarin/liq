import TopicIcon from './TopicIcon'

function progressFor(done, total) {
  if (!total) return 0
  return Math.min(100, Math.round((done / total) * 100))
}

export default function TopicGrid({ parents, counts, seenByParent, onOpen }) {
  return (
    <ul className="grid">
      {parents.map((parent) => {
        const total = counts[parent.id] ?? 0
        const done = seenByParent[parent.id] ?? 0
        return (
          <li key={parent.id} style={{ '--hue': parent.hue }}>
            <button
              type="button"
              className="card"
              onClick={() => onOpen(parent.id)}
              style={{ '--progress': `${progressFor(done, total)}%` }}
            >
              <span className="card-top">
                <span className="card-icon">
                  <TopicIcon id={parent.id} size={19} />
                </span>
                <span className="card-count">{total}</span>
              </span>
              <span className="card-name">{parent.name}</span>
              <span className="card-tag">{parent.children.map((child) => child.name).join(' · ')}</span>
              <span className="card-bar" aria-hidden="true">
                <span className="card-bar-fill" />
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
