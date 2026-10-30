import { calculateStudentBalance } from '../../utils/feeCalculators'
import { formatCurrency } from '../../utils/formatDate'
import FeeStatusBadge from './FeeStatusBadge'

const CELL_BG = {
  paid: 'bg-status-paidBg',
  partial: 'bg-status-partialBg',
  pending: 'bg-canvas',
}

export default function FeeLedgerTable({ matrix, feeRecords, onCellClick }) {
  if (matrix.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line py-14 text-center">
        <p className="text-sm font-medium text-ink">No students match this filter</p>
        <p className="mt-1 text-sm text-ink-muted">Add students, or adjust the class/section filter above.</p>
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-lg border border-line bg-surface shadow-panel">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 min-w-[200px] border-b border-r border-line bg-registry px-4 py-3 text-left font-display text-sm font-semibold text-canvas">
              Student
            </th>
            {matrix[0].months.map((m) => (
              <th
                key={m.month}
                className="min-w-[76px] border-b border-line bg-registry px-2 py-3 text-center font-display text-xs font-semibold uppercase tracking-wide text-canvas/90"
              >
                {m.label.slice(0, 3)}
              </th>
            ))}
            <th className="min-w-[110px] border-b border-line bg-registry px-3 py-3 text-right font-display text-xs font-semibold uppercase tracking-wide text-canvas/90">
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {matrix.map(({ student, months }, rowIndex) => {
            const { totalDue, balance } = calculateStudentBalance(feeRecords, student.id)
            return (
              <tr key={student.id} className={rowIndex % 2 === 1 ? 'bg-canvas/40' : ''}>
                <td className="sticky left-0 z-10 min-w-[200px] border-r border-b border-line bg-surface px-4 py-2.5">
                  <p className="font-medium text-ink">{student.full_name}</p>
                  <p className="font-mono text-xs text-ink-muted">
                    {student.admission_number} · {student.class}
                    {student.section ? `-${student.section}` : ''}
                  </p>
                </td>
                {months.map((m) => (
                  <td
                    key={m.month}
                    className={`border-b border-line px-2 py-2.5 text-center ${CELL_BG[m.status]}`}
                  >
                    <button
                      type="button"
                      onClick={() => onCellClick(student, m.month, m.record)}
                      className="flex w-full flex-col items-center gap-0.5 rounded transition-transform hover:scale-105"
                      title={`${m.label}: ${formatCurrency(m.amountPaid)} of ${formatCurrency(m.amountDue)}`}
                    >
                      <FeeStatusBadge status={m.status} compact />
                      <span className="tabular font-mono text-[11px] text-ink-muted">
                        {m.amountDue > 0 ? formatCurrency(m.amountPaid) : '—'}
                      </span>
                    </button>
                  </td>
                ))}
                <td className="border-b border-line px-3 py-2.5 text-right">
                  <p className="tabular font-mono text-sm font-medium text-ink">{formatCurrency(balance)}</p>
                  <p className="tabular font-mono text-[11px] text-ink-muted">
                    of {formatCurrency(totalDue)}
                  </p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
