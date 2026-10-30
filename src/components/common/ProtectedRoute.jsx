import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Sidebar from './Sidebar'
import Header from './Header'

export default function ProtectedRoute() {
  const { isAdmin, loading, authError } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="flex items-center gap-3 text-ink-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-registry" />
          Checking your session…
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace state={authError ? { authError } : undefined} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
