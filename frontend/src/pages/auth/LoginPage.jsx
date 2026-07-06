import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Hospital, LockKeyhole } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/services/authService'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { startSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function submit(event) {
    event.preventDefault(); setLoading(true)
    const { data, error } = await login(credentials)
    setLoading(false)
    if (error) return toast.error(error)
    startSession(data)
    navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true })
  }

  return (
    <div className="grid min-h-screen bg-slate-100 lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-blue-700 to-slate-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-3 font-bold"><Hospital className="text-orange-300" /> MediCare HMS</Link>
        <div><LockKeyhole className="h-12 w-12 text-orange-300" /><h1 className="mt-6 max-w-lg text-4xl font-bold">One secure workspace for coordinated hospital care.</h1><p className="mt-4 max-w-lg text-blue-100">Access is limited to accounts created and activated by the hospital administrator.</p></div>
        <p className="text-sm text-blue-200">Authorized hospital personnel only</p>
      </div>
      <div className="flex items-center justify-center p-5">
        <Card className="w-full max-w-md"><CardHeader><Button variant="ghost" asChild className="mb-4 w-fit px-0 text-slate-500"><Link to="/"><ArrowLeft /> Public site</Link></Button><CardTitle>Staff login</CardTitle><CardDescription>Use the account provided by your administrator. There is no public signup.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label>Email address</Label><Input type="email" required autoComplete="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} /></div><div className="space-y-2"><Label>Password</Label><Input type="password" required autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} /></div><Button className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in securely'}</Button></form></CardContent></Card>
      </div>
    </div>
  )
}
