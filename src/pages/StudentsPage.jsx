import { useState } from 'react'
import { useStudents } from '../hooks/useStudents'
import StudentTable from '../components/students/StudentTable'
import AddStudentModal from '../components/students/AddStudentModal'
import StudentFilter from '../components/students/StudentFilter'

export default function StudentsPage() {
  const [filters, setFilters] = useState({})
  const { students, loading, error, addStudent, updateStudent, deleteStudent } = useStudents(filters)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionError, setActionError] = useState(null)

  const openAddModal = () => {
    setEditingStudent(null)
    setModalOpen(true)
  }

  const openEditModal = (student) => {
    setEditingStudent(student)
    setModalOpen(true)
  }

  const handleSave = async (data) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, data)
    } else {
      await addStudent(data)
    }
  }

  const confirmDelete = async () => {
    setActionError(null)
    try {
      await deleteStudent(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setActionError(err.message || 'Could not delete this student.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Students</h2>
          <p className="mt-1 text-sm text-ink-muted">{students.length} shown</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-md bg-registry px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-registry-light"
        >
          Add student
        </button>
      </div>

      <div className="mb-4">
        <StudentFilter filters={filters} onChange={setFilters} />
      </div>

      {error && <p className="mb-4 rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">{error}</p>}
      {actionError && <p className="mb-4 rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">{actionError}</p>}

      <StudentTable students={students} loading={loading} onEdit={openEditModal} onDelete={setDeleteTarget} />

      <AddStudentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        student={editingStudent}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDeleteTarget(null)} aria-hidden="true" />
          <div className="relative w-full max-w-sm rounded-lg bg-surface p-6 shadow-panel">
            <h3 className="font-display text-lg font-semibold text-ink">Delete {deleteTarget.full_name}?</h3>
            <p className="mt-2 text-sm text-ink-muted">
              This permanently removes the student and every fee record tied to them. This can't be undone.
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
