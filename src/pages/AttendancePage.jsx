import { useCallback, useEffect, useState } from 'react'
import { useTeachers } from '../hooks/useTeachers'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../config/supabaseClient'
import DatePickerHeader from '../components/attendance/DatePickerHeader'
import AttendanceSheet from '../components/attendance/AttendanceSheet'
import { todayISO } from '../utils/formatDate'

export default function AttendancePage() {
  const { admin } = useAuth()
  const { teachers, loading: teachersLoading } = useTeachers({ isActive: true })
  const [date, setDate] = useState(todayISO())
  const [attendanceByTeacher, setAttendanceByTeacher] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingTeacherId, setSavingTeacherId] = useState(null)

  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('teacher_attendance')
      .select('*')
      .eq('date', date)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      const byTeacher = {}
      data.forEach((record) => {
        byTeacher[record.teacher_id] = record
      })
      setAttendanceByTeacher(byTeacher)
    }
    setLoading(false)
  }, [date])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const handleMark = async (teacherId, status) => {
    setSavingTeacherId(teacherId)
    setError(null)
    try {
      const { data, error: upsertError } = await supabase
        .from('teacher_attendance')
        .upsert(
          {
            teacher_id: teacherId,
            date,
            status,
            marked_by: admin?.id,
          },
          { onConflict: 'teacher_id,date' }
        )
        .select()
        .single()

      if (upsertError) throw upsertError
      setAttendanceByTeacher((prev) => ({ ...prev, [teacherId]: data }))
    } catch (err) {
      setError(err.message || 'Could not save attendance for this teacher.')
    } finally {
      setSavingTeacherId(null)
    }
  }

  const markedCount = Object.keys(attendanceByTeacher).length

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Attendance</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {markedCount} of {teachers.length} teachers marked
          </p>
        </div>
        <DatePickerHeader date={date} onChange={setDate} />
      </div>

      {error && <p className="mb-4 rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">{error}</p>}

      {loading || teachersLoading ? (
        <p className="text-sm text-ink-muted">Loading attendance…</p>
      ) : (
        <AttendanceSheet
          teachers={teachers}
          attendanceByTeacher={attendanceByTeacher}
          onMark={handleMark}
          savingTeacherId={savingTeacherId}
        />
      )}
    </div>
  )
}
