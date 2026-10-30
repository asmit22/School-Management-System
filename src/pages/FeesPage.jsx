import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../config/supabaseClient'
import { useStudents } from '../hooks/useStudents'
import { useFees } from '../hooks/useFees'
import { buildFeeMatrix, summarizeFeeRecords } from '../utils/feeCalculators'
import { formatCurrency } from '../utils/formatDate'
import { SESSION_MONTHS } from '../utils/constants'
import StudentFilter from '../components/students/StudentFilter'
import FeeLedgerTable from '../components/fees/FeeLedgerTable'
import CollectFeeModal from '../components/fees/CollectFeeModal'
import Modal from '../components/common/Modal'

export default function FeesPage() {
  const [sessions, setSessions] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState(null)
  const [sessionModalOpen, setSessionModalOpen] = useState(false)

  const [filters, setFilters] = useState({ isActive: true })
  const { students, loading: studentsLoading } = useStudents(filters)
  const { feeRecords, loading: feesLoading, error: feesError, recordPayment } = useFees(selectedSessionId)

  const [activeCell, setActiveCell] = useState(null) // { student, month, record }

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true)
    setSessionsError(null)
    const { data, error } = await supabase.from('sessions').select('*').order('start_date', { ascending: false })
    if (error) {
      setSessionsError(error.message)
    } else {
      setSessions(data)
      setSelectedSessionId((current) => current || data.find((s) => s.is_active)?.id || data[0]?.id || '')
    }
    setSessionsLoading(false)
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)
  const matrix = buildFeeMatrix(students, feeRecords)
  const { totalDue, totalPaid } = summarizeFeeRecords(feeRecords)

  const handleCellClick = (student, month, record) => {
    setActiveCell({ student, month, record })
  }

  const handleSaveFee = async (values) => {
    await recordPayment({ studentId: activeCell.student.id, month: activeCell.month, ...values })
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Fees</h2>
          <p className="mt-1 text-sm text-ink-muted">April–March session ledger</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSessionId}
            onChange={(event) => setSelectedSessionId(event.target.value)}
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-registry"
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
                {session.is_active ? ' (active)' : ''}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSessionModalOpen(true)}
            className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-registry hover:text-registry"
          >
            + New session
          </button>
        </div>
      </div>

      {selectedSession && (
        <div className="mb-4 flex flex-wrap gap-6 rounded-lg border border-line bg-surface px-5 py-3 shadow-panel">
          <div>
            <p className="text-xs text-ink-muted">Collected</p>
            <p className="tabular font-mono text-lg font-semibold text-status-paid">{formatCurrency(totalPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Outstanding</p>
            <p className="tabular font-mono text-lg font-semibold text-status-pending">
              {formatCurrency(totalDue - totalPaid)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Total due</p>
            <p className="tabular font-mono text-lg font-semibold text-ink">{formatCurrency(totalDue)}</p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <StudentFilter filters={filters} onChange={setFilters} />
      </div>

      {(sessionsError || feesError) && (
        <p className="mb-4 rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">
          {sessionsError || feesError}
        </p>
      )}

      {sessionsLoading ? (
        <p className="text-sm text-ink-muted">Loading sessions…</p>
      ) : !selectedSession ? (
        <div className="rounded-lg border border-dashed border-line py-14 text-center">
          <p className="text-sm font-medium text-ink">No session yet</p>
          <p className="mt-1 text-sm text-ink-muted">Create an academic session (e.g. 2026-2027) to start tracking fees.</p>
        </div>
      ) : studentsLoading || feesLoading ? (
        <p className="text-sm text-ink-muted">Loading ledger…</p>
      ) : (
        <FeeLedgerTable matrix={matrix} feeRecords={feeRecords} onCellClick={handleCellClick} />
      )}

      <CollectFeeModal
        isOpen={Boolean(activeCell)}
        onClose={() => setActiveCell(null)}
        onSave={handleSaveFee}
        student={activeCell?.student}
        monthLabel={activeCell ? SESSION_MONTHS[activeCell.month - 1] : ''}
        record={activeCell?.record}
      />

      <NewSessionModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        onCreated={(session) => {
          setSessions((prev) => [session, ...prev.map((s) => (session.is_active ? { ...s, is_active: false } : s))])
          setSelectedSessionId(session.id)
        }}
      />
    </div>
  )
}

function NewSessionModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [setActive, setSetActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setStartDate('')
      setEndDate('')
      setSetActive(true)
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (setActive) {
        const { error: clearError } = await supabase.from('sessions').update({ is_active: false }).eq('is_active', true)
        if (clearError) throw clearError
      }
      const { data, error: insertError } = await supabase
        .from('sessions')
        .insert({ name, start_date: startDate, end_date: endDate, is_active: setActive })
        .select()
        .single()
      if (insertError) throw insertError
      onCreated(data)
      onClose()
    } catch (err) {
      setError(err.message || 'Could not create this session.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-registry'

  return (
    <Modal
      title="New session"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-ink-muted hover:bg-canvas">
            Cancel
          </button>
          <button
            type="submit"
            form="session-form"
            disabled={saving}
            className="rounded-md bg-registry px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-registry-light disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create session'}
          </button>
        </>
      }
    >
      <form id="session-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">{error}</p>}

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Session name</span>
          <input required placeholder="e.g. 2027-2028" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Start date</span>
            <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">End date</span>
            <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={setActive} onChange={(e) => setSetActive(e.target.checked)} />
          Make this the active session
        </label>
      </form>
    </Modal>
  )
}
