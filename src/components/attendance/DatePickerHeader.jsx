import { formatDate, todayISO } from '../../utils/formatDate'

function shiftDate(dateString, days) {
  const date = new Date(dateString)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export default function DatePickerHeader({ date, onChange }) {
  const isToday = date === todayISO()

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(shiftDate(date, -1))}
        aria-label="Previous day"
        className="rounded-md border border-line bg-surface p-2 text-ink-muted transition-colors hover:border-registry hover:text-registry"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <input
        type="date"
        value={date}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-registry"
      />

      <button
        type="button"
        onClick={() => onChange(shiftDate(date, 1))}
        aria-label="Next day"
        className="rounded-md border border-line bg-surface p-2 text-ink-muted transition-colors hover:border-registry hover:text-registry"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {!isToday && (
        <button
          type="button"
          onClick={() => onChange(todayISO())}
          className="text-sm font-medium text-registry hover:underline"
        >
          Jump to today
        </button>
      )}

      <span className="ml-1 text-sm text-ink-muted">{formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
    </div>
  )
}
