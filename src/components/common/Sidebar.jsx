import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/students', label: 'Students' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/fees', label: 'Fees' },
]

export default function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-registry text-canvas">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-display text-sm font-semibold text-registry-dark">
          S
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">Registry</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-registry-light text-canvas'
                  : 'text-canvas/70 hover:bg-registry-light/60 hover:text-canvas'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-canvas/10 px-6 py-4 text-xs text-canvas/50">
        Academic session runs April – March
      </div>
    </aside>
  )
}
