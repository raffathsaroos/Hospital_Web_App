import { CalendarDays, Clock3, ShieldCheck, Stethoscope, Users } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'

const overview = [
  { label: 'Patient records', value: 'Centralized', icon: Users },
  { label: 'Appointments', value: 'Live queue', icon: CalendarDays },
  { label: 'Clinical teams', value: '7 roles', icon: Stethoscope },
  { label: 'Account access', value: 'Protected', icon: ShieldCheck },
]

export default function DashboardPage() {
  const { user } = useAuth()
  return <div><TopBar title="Dashboard" /><div className="rounded-2xl bg-gradient-to-r from-blue-700 to-slate-700 p-7 text-white"><p className="text-blue-100">Welcome back, {user?.firstName}</p><h2 className="mt-1 text-3xl font-bold">Your hospital workspace</h2><p className="mt-3 max-w-2xl text-blue-100">Review today’s care operations and continue with the modules available to your {user?.role} account.</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{overview.map(({ label, value, icon: Icon }, index) => <Card key={label} className="border-slate-200"><CardContent className="flex items-center gap-4 p-5"><span className={`rounded-xl p-3 ${index === 1 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}><Icon /></span><div><p className="text-sm text-slate-500">{label}</p><p className="font-semibold text-slate-900">{value}</p></div></CardContent></Card>)}</div><Card className="mt-6"><CardContent className="flex items-start gap-4 p-6"><Clock3 className="mt-1 text-orange-600" /><div><h3 className="font-semibold text-slate-900">Built for the daily workflow</h3><p className="mt-1 text-sm text-slate-500">Use the sidebar to move between the modules permitted for your account. Inactive accounts are denied at login and records remain available for audit history.</p></div></CardContent></Card></div>
}
