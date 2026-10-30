import { ATTENDANCE_STATUSES } from '../../utils/constants'

const STATUS_STYLES = {
  present: 'bg-status-paidBg text-status-paid border-status-paid',
  absent: 'bg-status-pendingBg text-status-pending border-status-pending',
  half_day: 'bg-status-partialBg text-status-partial border-status-partial',
  leave: 'bg-canvas text-ink-soft border-line',
}

export default function AttendanceSheet({ teachers, attendanceByTeacher, onMark, savingTeacherId }) {
  if (teachers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line py-14 text-center">
        <p className="text-sm font-medium text-ink">No active teachers to mark</p>
        <p className="mt-1 text-sm text-ink-muted">Add teachers first from the Teachers page.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-panel">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-4 py-3 font-medium">Teacher</th>
            <th className="px-4 py-3 font-medium">Subject</th>
            <th className="px-4 py-3 font-medium">Mark attendance</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => {
            const record = attendanceByTeacher[teacher.id]
            const isSaving = savingTeacherId === teacher.id
            return (
              <tr key={teacher.id} className="border-b border-line last:border-0 hover:bg-canvas/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{teacher.full_name}</p>
                  <p className="font-mono text-xs text-ink-muted">{teacher.employee_code}</p>
                </td>
                <td className="px-4 py-3 text-ink-muted">{teacher.subject || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {ATTENDANCE_STATUSES.map(({ value, label }) => {
                      const isSelected = record?.status === value
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={isSaving}
                          onClick={() => onMark(teacher.id, value)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                            isSelected ? STATUS_STYLES[value] : 'border-line bg-surface text-ink-muted hover:border-registry hover:text-registry'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
