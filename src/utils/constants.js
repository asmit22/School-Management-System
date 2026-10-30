// A session runs April → March. Array position + 1 is the `month` value
// stored in fee_records (1 = April … 12 = March) — keep this in sync with
// the CHECK constraint on public.fee_records in supabase/schema.sql.
export const SESSION_MONTHS = [
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
]

export const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'half_day', label: 'Half day' },
  { value: 'leave', label: 'Leave' },
]

export const FEE_STATUS = {
  PAID: 'paid',
  PARTIAL: 'partial',
  PENDING: 'pending',
}

export const PAYMENT_MODES = ['cash', 'online', 'upi', 'cheque', 'bank_transfer']

export const STUDENT_GENDERS = ['Male', 'Female', 'Other']
