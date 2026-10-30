import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../config/supabaseClient'
import { formatCurrency, formatDate, todayISO } from '../utils/formatDate'

const EMPTY_STATS = {
  studentCount: 0,
  teacherCount: 0,
  todayPresent: 0,
  todayAbsent: 0,
  todayUnmarked: 0,
  sessionName: null,
  sessionDue: 0,
  sessionPaid: 0,
}

function StatCard({ label, value, sub, to }) {
  const content = (
    <div className="rounded-lg border border-line bg-surface p-5 shadow-panel transition-colors hover:border-registry">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function Dashboard() {
  const [stats, setStats] = useState(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setLoading(true)
      setError(null)
      const today = todayISO()

      const [studentsRes, teachersRes, attendanceRes, sessionRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('teacher_attendance').select('status').eq('date', today),
        supabase.from('sessions').select('*').eq('is_active', true).maybeSingle(),
      ])

      const firstError =
        studentsRes.error || teachersRes.error || attendanceRes.error || sessionRes.error
      if (firstError) {
        if (isMounted) {
          setError(firstError.message)
          setLoading(false)
        }
        return
      }

      let sessionDue = 0
      let sessionPaid = 0
      if (sessionRes.data) {
        const { data: feeRecords, error: feeError } = await supabase
          .from('fee_records')
          .select('amount_due, amount_paid')
          .eq('session_id', sessionRes.data.id)
        if (feeError) {
          if (isMounted) {
            setError(feeError.message)
            setLoading(false)
          }
          return
        }
        feeRecords?.forEach((r) => {
          sessionDue += Number(r.amount_due)
          sessionPaid += Number(r.amount_paid)
        })
      }

      const attendanceToday = attendanceRes.data ?? []
      const present = attendanceToday.filter((a) => a.status === 'present').length
      const absent = attendanceToday.filter((a) => a.status === 'absent').length
      const teacherCount = teachersRes.count ?? 0

      if (isMounted) {
        setStats({
          studentCount: studentsRes.count ?? 0,
          teacherCount,
          todayPresent: present,
          todayAbsent: absent,
          todayUnmarked: Math.max(teacherCount - attendanceToday.length, 0),
          sessionName: sessionRes.data?.name ?? null,
          sessionDue,
          sessionPaid,
        })
        setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Dashboard</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {formatDate(todayISO(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {stats.sessionName && ` · Session ${stats.sessionName}`}
        </p>
      </div>

      {error && <p className="mb-4 rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading dashboard…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active students" value={stats.studentCount} to="/students" />
          <StatCard label="Active teachers" value={stats.teacherCount} to="/teachers" />
          <StatCard
            label="Today's attendance"
            value={`${stats.todayPresent} present`}
            sub={`${stats.todayAbsent} absent · ${stats.todayUnmarked} unmarked`}
            to="/attendance"
          />
          <StatCard
            label={stats.sessionName ? `Fees collected (${stats.sessionName})` : 'Fees collected'}
            value={formatCurrency(stats.sessionPaid)}
            sub={`of ${formatCurrency(stats.sessionDue)} due`}
            to="/fees"
          />
        </div>
      )}
    </div>
  )
}
