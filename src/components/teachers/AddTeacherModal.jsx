import { useEffect, useState } from 'react'
import Modal from '../common/Modal'

const EMPTY_FORM = {
  employee_code: '',
  full_name: '',
  email: '',
  phone: '',
  subject: '',
  qualification: '',
  joining_date: new Date().toISOString().split('T')[0],
  is_active: true,
}

export default function AddTeacherModal({ isOpen, onClose, onSave, teacher }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setForm(teacher ? { ...EMPTY_FORM, ...teacher } : EMPTY_FORM)
      setError(null)
    }
  }, [isOpen, teacher])

  const handleChange = (field) => (event) => {
    const value = field === 'is_active' ? event.target.value === 'true' : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave({
        ...form,
        email: form.email || null,
        phone: form.phone || null,
        subject: form.subject || null,
        qualification: form.qualification || null,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save this teacher.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-registry'

  return (
    <Modal
      title={teacher ? 'Edit teacher' : 'Add teacher'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-ink-muted hover:bg-canvas">
            Cancel
          </button>
          <button
            type="submit"
            form="teacher-form"
            disabled={saving}
            className="rounded-md bg-registry px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-registry-light disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save teacher'}
          </button>
        </>
      }
    >
      <form id="teacher-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Employee code</span>
            <input required value={form.employee_code} onChange={handleChange('employee_code')} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Full name</span>
            <input required value={form.full_name} onChange={handleChange('full_name')} className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Email</span>
            <input type="email" value={form.email} onChange={handleChange('email')} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Phone</span>
            <input value={form.phone} onChange={handleChange('phone')} className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Subject</span>
            <input value={form.subject} onChange={handleChange('subject')} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Qualification</span>
            <input value={form.qualification} onChange={handleChange('qualification')} className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Joining date</span>
            <input required type="date" value={form.joining_date} onChange={handleChange('joining_date')} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Status</span>
            <select value={String(form.is_active)} onChange={handleChange('is_active')} className={inputClass}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
        </div>
      </form>
    </Modal>
  )
}
