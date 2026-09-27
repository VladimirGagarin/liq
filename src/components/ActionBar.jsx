const ICONS = {
  like: 'M12 20.3l-1.1-1C6 14.9 3.4 12.5 3.4 9.6 3.4 7.2 5.3 5.4 7.7 5.4c1.4 0 2.7.6 3.5 1.6l.8 1 .8-1c.8-1 2.1-1.6 3.5-1.6 2.4 0 4.3 1.8 4.3 4.2 0 2.9-2.6 5.3-7.5 9.7l-1.1 1z',
  discuss:
    'M4.5 5.5h15a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1H10l-4 3.2v-3.2H4.5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z',
  remind: 'M12 3.5a5.5 5.5 0 0 0-5.5 5.5v3.6l-1.7 2.8h14.4l-1.7-2.8V9A5.5 5.5 0 0 0 12 3.5zM10 18.4a2 2 0 0 0 4 0',
  keep: 'M6.5 4.5h11a1 1 0 0 1 1 1v15l-6.5-4.2-6.5 4.2v-15a1 1 0 0 1 1-1z',
  share: 'M12 3.6v11M12 3.6 8.2 7.4M12 3.6l3.8 3.8M5 13.4v5.4a1.2 1.2 0 0 0 1.2 1.2h11.6a1.2 1.2 0 0 0 1.2-1.2v-5.4',
}

/** One action in the bar: icon over label, with a count when the count is known. */
export function Act({ icon, label, count, disabled, onClick, pressed, title }) {
  return (
    <button
      type="button"
      className={pressed ? 'act on' : 'act'}
      disabled={disabled}
      aria-pressed={pressed}
      title={title ?? label}
      onClick={onClick}
    >
      <span className="act-icon-wrap">
        <svg
          className="act-icon"
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill={pressed ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={ICONS[icon]} />
        </svg>
        {count === undefined ? null : <span className="act-n">{count}</span>}
      </span>
      <span className="act-label">{label}</span>
    </button>
  )
}

export default function ActionBar({ children }) {
  return <div className="act-bar">{children}</div>
}
