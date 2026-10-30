import { formatDate } from '../../utils/formatDate'

export default function TeacherList({ teachers, loading, onEdit, onDelete }) {
  if (loading) {
    return <p className="py-10 text-center text-sm text-ink-muted">Loading teachers…</p>
  }

  if (teachers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line py-14 text-center">
        <p className="text-sm font-medium text-ink">No teachers yet</p>
        <p className="mt-1 text-sm text-ink-muted">Add your first teacher to start tracking attendance.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teachers.map((teacher) => (
        <div key={teacher.id} className="rounded-lg border border-line bg-surface p-5 shadow-panel">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-base font-semibold text-ink">{teacher.full_name}</p>
              <p className="font-mono text-xs text-ink-muted">{teacher.employee_code}</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                teacher.is_active ? 'bg-status-paidBg text-status-paid' : 'bg-canvas text-ink-soft'
              }`}
            >
              {teacher.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subject</dt>
              <dd className="text-ink">{teacher.subject || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Phone</dt>
              <dd className="text-ink">{teacher.phone || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Joined</dt>
              <dd className="text-ink">{formatDate(teacher.joining_date)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex justify-end gap-3 border-t border-line pt-3">
            <button type="button" onClick={() => onEdit(teacher)} className="text-sm font-medium text-registry hover:underline">
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(teacher)}
              className="text-sm font-medium text-status-pending hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
