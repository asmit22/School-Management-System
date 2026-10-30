import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { admin, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
  }

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface px-8 py-4">
      <p className="font-display text-lg font-semibold text-ink">School Management System</p>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-ink">{admin?.full_name}</p>
          <p className="text-xs text-ink-muted">{admin?.email}</p>
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-registry font-display text-sm font-semibold text-canvas"
          aria-hidden="true"
        >
          {admin?.full_name?.charAt(0)?.toUpperCase() ?? 'A'}
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:border-status-pending hover:text-status-pending disabled:opacity-50"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </header>
  )
}
