import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import { PAYMENT_MODES } from '../../utils/constants'
import { getFeeStatus } from '../../utils/feeCalculators'
import FeeStatusBadge from './FeeStatusBadge'
import { todayISO } from '../../utils/formatDate'

const EMPTY_FORM = {
  amount_due: '0',
  amount_paid: '0',
  payment_date: todayISO(),
  payment_mode: 'cash',
  remarks: '',
}

export default function CollectFeeModal({ isOpen, onClose, onSave, student, monthLabel, record }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setForm(
        record
          ? {
              amount_due: String(record.amount_due ?? 0),
              amount_paid: String(record.amount_paid ?? 0),
              payment_date: record.payment_date || todayISO(),
              payment_mode: record.payment_mode || 'cash',
              remarks: record.remarks || '',
            }
          : EMPTY_FORM
      )
      setError(null)
    }
  }, [isOpen, record])

  if (!student) return null

  const previewStatus = getFeeStatus(form.amount_due, form.amount_paid)

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const amountDue = Number(form.amount_due)
    const amountPaid = Number(form.amount_paid)

    if (Number.isNaN(amountDue) || Number.isNaN(amountPaid) || amountDue < 0 || amountPaid < 0) {
      setError('Amounts must be zero or a positive number.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSave({
        amountDue,
        amountPaid,
        paymentDate: amountPaid > 0 ? form.payment_date : null,
        paymentMode: amountPaid > 0 ? form.payment_mode : null,
        remarks: form.remarks,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save this fee record.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-registry'

  return (
    <Modal
      title={`${monthLabel} fee — ${student.full_name}`}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-ink-muted hover:bg-canvas">
            Cancel
          </button>
          <button
            type="submit"
            form="fee-form"
            disabled={saving}
            className="rounded-md bg-registry px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-registry-light disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save record'}
          </button>
        </>
      }
    >
      <form id="fee-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">{error}</p>}

        <div className="flex items-center justify-between rounded-md bg-canvas px-3 py-2">
          <span className="text-sm text-ink-muted">Resulting status</span>
          <FeeStatusBadge status={previewStatus} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Amount due (₹)</span>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={form.amount_due}
              onChange={handleChange('amount_due')}
              className={`${inputClass} tabular font-mono`}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Amount paid (₹)</span>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={form.amount_paid}
              onChange={handleChange('amount_paid')}
              className={`${inputClass} tabular font-mono`}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Payment date</span>
            <input type="date" value={form.payment_date} onChange={handleChange('payment_date')} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Payment mode</span>
            <select value={form.payment_mode} onChange={handleChange('payment_mode')} className={inputClass}>
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Remarks</span>
          <textarea value={form.remarks} onChange={handleChange('remarks')} className={inputClass} rows={2} />
        </label>
      </form>
    </Modal>
  )
}
