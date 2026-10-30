import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import { STUDENT_GENDERS } from '../../utils/constants'

const EMPTY_FORM = {
  admission_number: '',
  full_name: '',
  class: '',
  section: '',
  gender: '',
  date_of_birth: '',
  parent_name: '',
  parent_phone: '',
  address: '',
  admission_date: new Date().toISOString().split('T')[0],
  is_active: true,
}

export default function AddStudentModal({ isOpen, onClose, onSave, student }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setForm(student ? { ...EMPTY_FORM, ...student } : EMPTY_FORM)
      setError(null)
    }
  }, [isOpen, student])

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
        section: form.section || null,
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
        parent_name: form.parent_name || null,
        parent_phone: form.parent_phone || null,
        address: form.address || null,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save this student.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-registry'

  return (
    <Modal
      title={student ? 'Edit student' : 'Add student'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-ink-muted hover:bg-canvas">
            Cancel
          </button>
          <button
            type="submit"
            form="student-form"
            disabled={saving}
            className="rounded-md bg-registry px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-registry-light disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save student'}
          </button>
        </>
      }
    >
      <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Admission number</span>
            <input required value={form.admission_number} onChange={handleChange('admission_number')} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Full name</span>
            <input required value={form.full_name} onChange={handleChange('full_name')} className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Class</span>
            <input required value={form.class} onChange={handleChange('class')} className={inputClass} placeholder="e.g. 8" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Section</span>
            <input value={form.section} onChange={handleChange('section')} className={inputClass} placeholder="e.g. A" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Gender</span>
            <select value={form.gender} onChange={handleChange('gender')} className={inputClass}>
              <option value="">—</option>
              {STUDENT_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Date of birth</span>
            <input type="date" value={form.date_of_birth} onChange={handleChange('date_of_birth')} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Admission date</span>
            <input required type="date" value={form.admission_date} onChange={handleChange('admission_date')} className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Parent / guardian name</span>
            <input value={form.parent_name} onChange={handleChange('parent_name')} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Parent phone</span>
            <input value={form.parent_phone} onChange={handleChange('parent_phone')} className={inputClass} />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Address</span>
          <textarea value={form.address} onChange={handleChange('address')} className={inputClass} rows={2} />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Status</span>
          <select value={String(form.is_active)} onChange={handleChange('is_active')} className={inputClass}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
      </form>
    </Modal>
  )
}
