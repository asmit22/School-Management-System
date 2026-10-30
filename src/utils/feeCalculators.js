import { SESSION_MONTHS, FEE_STATUS } from './constants'

/**
 * Mirrors the generated `status` column on fee_records (see schema.sql) so
 * the UI can compute a status locally for a month that has no record yet,
 * without waiting on a round trip.
 */
export function getFeeStatus(amountDue, amountPaid) {
  const due = Number(amountDue) || 0
  const paid = Number(amountPaid) || 0
  if (paid <= 0) return FEE_STATUS.PENDING
  if (paid >= due && due > 0) return FEE_STATUS.PAID
  return FEE_STATUS.PARTIAL
}

/** Total due / paid / balance across a set of fee_records rows. */
export function summarizeFeeRecords(feeRecords) {
  return feeRecords.reduce(
    (summary, record) => {
      summary.totalDue += Number(record.amount_due) || 0
      summary.totalPaid += Number(record.amount_paid) || 0
      return summary
    },
    { totalDue: 0, totalPaid: 0 }
  )
}

/** Due / paid / balance for a single student within a set of fee_records rows. */
export function calculateStudentBalance(feeRecords, studentId) {
  const studentRecords = feeRecords.filter((r) => r.student_id === studentId)
  const { totalDue, totalPaid } = summarizeFeeRecords(studentRecords)
  return { totalDue, totalPaid, balance: totalDue - totalPaid }
}

/**
 * Builds the April→March ledger matrix: one row per student, one cell per
 * month. Months with no fee_records row yet still get a cell so the grid
 * stays a full 12 columns — they show as "pending" with a zero amount until
 * an admin sets a due amount via CollectFeeModal.
 */
export function buildFeeMatrix(students, feeRecords) {
  return students.map((student) => {
    const months = SESSION_MONTHS.map((label, i) => {
      const monthNumber = i + 1
      const record = feeRecords.find(
        (r) => r.student_id === student.id && r.month === monthNumber
      )
      return {
        month: monthNumber,
        label,
        record: record ?? null,
        status: record ? record.status ?? getFeeStatus(record.amount_due, record.amount_paid) : FEE_STATUS.PENDING,
        amountDue: record ? Number(record.amount_due) : 0,
        amountPaid: record ? Number(record.amount_paid) : 0,
      }
    })
    return { student, months }
  })
}
