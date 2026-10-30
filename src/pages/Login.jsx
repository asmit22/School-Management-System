import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { isAdmin, loading, signIn } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(location.state?.authError || null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : err.message || 'Sign-in failed. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-registry px-4">
      <div className="w-full max-w-sm rounded-lg bg-surface p-8 shadow-panel">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-registry font-display text-lg font-semibold text-canvas">
            S
          </span>
          <h1 className="font-display text-xl font-semibold text-ink">School Management System</h1>
          <p className="mt-1 text-sm text-ink-muted">Sign in with your administrator account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-md bg-status-pendingBg px-3 py-2 text-sm text-status-pending">{error}</p>}

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-registry"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-registry"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-registry py-2.5 text-sm font-medium text-canvas transition-colors hover:bg-registry-light disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-soft">
          Accounts are created by your system administrator — there is no self sign-up.
        </p>
      </div>
    </div>
  )
}
