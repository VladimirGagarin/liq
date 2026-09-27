const MARKS = {
  mind: (
    <>
      <path d="M12 4a7.5 7.5 0 0 0-7.5 7.5c0 2 1 3.2 1 4.6V18a2 2 0 0 0 2 2h1.6v2h5.8v-2.2a6.6 6.6 0 0 0 3.1-5.8A7.5 7.5 0 0 0 12 4z" />
      <circle cx="10" cy="11" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  reasoning: (
    <>
      <path d="M4.5 9h15" />
      <path d="M4.5 15h15" />
      <path d="M9.5 5.5l4 4-4 4" />
      <path d="M14.5 5.5l4 4-4 4" />
    </>
  ),
  universe: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <ellipse cx="12" cy="12" rx="9" ry="3.7" />
      <ellipse cx="12" cy="12" rx="9" ry="3.7" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.7" transform="rotate(-60 12 12)" />
    </>
  ),
  life: (
    <>
      <path d="M12 20.5c-4.6-3-7.2-6-7.2-9.4a4.1 4.1 0 0 1 7.2-2.7 4.1 4.1 0 0 1 7.2 2.7c0 3.4-2.6 6.4-7.2 9.4z" />
      <path d="M9 10.5h6M12 7.5v6" />
    </>
  ),
  language: (
    <>
      <path d="M3.5 7.5h9" />
      <path d="M8 5v2.5" />
      <path d="M10.5 7.5c0 4-2.6 6.6-6 7.5" />
      <path d="M6.4 12.2c1.2 2 3 3.4 5 4" />
      <path d="M13 20.5l3.4-8 3.4 8" />
      <path d="M14.2 17.4h4.4" />
    </>
  ),
  beauty: (
    <>
      <path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.2 0 1.8-.9 1.8-1.7 0-.9.6-1.5 1.4-1.5h1.6a3.7 3.7 0 0 0 3.7-3.7c0-5.5-3.8-10.1-8.5-10.1z" />
      <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.6" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  career: (
    <>
      <rect x="3.5" y="7" width="17" height="12" rx="2.2" />
      <path d="M9 7V5.6A1.6 1.6 0 0 1 10.6 4h2.8A1.6 1.6 0 0 1 15 5.6V7" />
    </>
  ),
  economy: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.4v9.2" />
      <path d="M14.6 9.8a2.8 2.8 0 0 0-2.6-1.3c-1.5 0-2.6.8-2.6 2s1 1.6 2.6 2 2.8.8 2.8 2.1-1.2 2-2.8 2a3 3 0 0 1-2.8-1.4" />
    </>
  ),
  relationships: (
    <>
      <circle cx="9.4" cy="12" r="6.2" />
      <circle cx="14.6" cy="12" r="6.2" />
    </>
  ),
  everyday: (
    <>
      <path d="M4 11.5 12 4.5l8 7" />
      <path d="M6 10.6V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8.4" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  technology: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2.2" />
      <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
    </>
  ),
  culture: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 4v2.4M12 17.6V20M4 12h2.4M17.6 12H20" />
    </>
  ),
}

export default function TopicIcon({ id, size = 20, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {MARKS[id] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  )
}
