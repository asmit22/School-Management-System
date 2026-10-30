import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 text-center">
      <p className="font-display text-6xl font-semibold text-registry">404</p>
      <h1 className="mt-3 font-display text-xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-ink-muted">The page you're looking for doesn't exist or has moved.</p>
      <Link
        to="/dashboard"
        className="mt-6 rounded-md bg-registry px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-registry-light"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
