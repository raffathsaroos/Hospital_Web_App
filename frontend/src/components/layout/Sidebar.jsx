import { NavLink } from 'react-router-dom'
import { Hospital, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/patients', label: 'Patients', icon: Users },
]

// Shows the main hospital navigation and staff area.
export default function Sidebar() {
  return (
    <aside className="flex w-[220px] flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-5">
        <Hospital className="h-6 w-6 text-blue-400" />
        <span className="text-lg font-semibold text-white">HMS</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-700" />
          <div>
            <p className="text-xs font-medium text-slate-300">Staff</p>
            <p className="text-xs text-slate-500">Hospital Management</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
