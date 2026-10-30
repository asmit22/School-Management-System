import { useState } from 'react'
import { useTeachers } from '../hooks/useTeachers'
import TeacherList from '../components/teachers/TeacherList'
import AddTeacherModal from '../components/teachers/AddTeacherModal'

export default function TeachersPage() {
  const { teachers, loading, error, addTeacher, updateTeacher, deleteTeacher } = useTeachers()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionError, setActionError] = useState(null)

  const openAddModal = () => {
    setEditingTeacher(null)
    setModalOpen(true)
  }

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher)
    setModalOpen(true)
  }

  const handleSave = async (data) => {
    if (editingTeacher) {
      await updateTeacher(editingTeacher.id, data)
    } else {
      await addTeacher(data)
    }
  }

  const confirmDelete = async () => {
    setActionError(null)
    try {
      await deleteTeacher(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setActionError(err.message || 'Could not delete this teacher.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Teachers</h2>
          <p className="mt-1 text-sm text-ink-muted">{teachers.length} on record</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-md bg-registry px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-registry-light"
        >
          Add teacher
        </button>
      </div>

      {error && <p className="mb-4 rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">{error}</p>}
      {actionError && <p className="mb-4 rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">{actionError}</p>}

      <TeacherList teachers={teachers} loading={loading} onEdit={openEditModal} onDelete={setDeleteTarget} />

      <AddTeacherModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        teacher={editingTeacher}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDeleteTarget(null)} aria-hidden="true" />
          <div className="relative w-full max-w-sm rounded-lg bg-surface p-6 shadow-panel">
            <h3 className="font-display text-lg font-semibold text-ink">Delete {deleteTarget.full_name}?</h3>
            <p className="mt-2 text-sm text-ink-muted">
              This permanently removes the teacher and every attendance record tied to them. This can't be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-ink-muted hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-status-pending px-4 py-2 text-sm font-medium text-canvas hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
