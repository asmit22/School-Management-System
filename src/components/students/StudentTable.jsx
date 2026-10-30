import { formatDate } from '../../utils/formatDate'

export default function StudentTable({ students, loading, onEdit, onDelete }) {
  if (loading) {
    return <p className="py-10 text-center text-sm text-ink-muted">Loading students…</p>
  }

  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line py-14 text-center">
        <p className="text-sm font-medium text-ink">No students match this filter</p>
        <p className="mt-1 text-sm text-ink-muted">Add a student, or clear the filter to see everyone.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-panel">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-4 py-3 font-medium">Admission #</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Class</th>
            <th className="px-4 py-3 font-medium">Parent</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Admitted</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b border-line last:border-0 hover:bg-canvas/60">
              <td className="px-4 py-3 font-mono text-ink-muted">{student.admission_number}</td>
              <td className="px-4 py-3 font-medium text-ink">{student.full_name}</td>
              <td className="px-4 py-3 text-ink-muted">
                {student.class}
                {student.section ? `-${student.section}` : ''}
              </td>
              <td className="px-4 py-3 text-ink-muted">{student.parent_name || '—'}</td>
              <td className="px-4 py-3 text-ink-muted">{student.parent_phone || '—'}</td>
              <td className="px-4 py-3 text-ink-muted">{formatDate(student.admission_date)}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    student.is_active ? 'bg-status-paidBg text-status-paid' : 'bg-canvas text-ink-soft'
                  }`}
                >
                  {student.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(student)}
                  className="mr-3 font-medium text-registry hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(student)}
                  className="font-medium text-status-pending hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
