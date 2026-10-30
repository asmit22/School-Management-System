export function formatDate(dateString, options) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', options ?? { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatCurrency(amount) {
  const value = Number(amount) || 0
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

/** Today's date as YYYY-MM-DD, in the browser's local time (not UTC). */
export function todayISO() {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offsetMs).toISOString().split('T')[0]
}
