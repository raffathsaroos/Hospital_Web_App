import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import TopBar from '@/components/layout/TopBar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getUser, updateUser } from '@/services/userService'

export default function StaffEditPage({ role, slug }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  useEffect(() => { getUser(id).then((result) => { if (result.error) return setError(result.error); const user = result.data.user; if (user.role !== role) return setError(`This account is not a ${role}.`); setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, nic: user.nic, dob: user.dob?.split('T')[0] ?? '', gender: user.gender, password: '' }) }) }, [id, role])
  async function submit(event) { event.preventDefault(); const body = { ...form }; if (!body.password) delete body.password; const result = await updateUser(id, body); if (result.error) return toast.error(result.error); toast.success(`${role} updated successfully`); navigate(`/staff/${slug}`) }

  if (error) return <Alert className="border-orange-300 bg-orange-50"><AlertDescription>{error}</AlertDescription></Alert>
  if (!form) return <p className="text-sm text-slate-500">Loading account...</p>
  return <div><TopBar title={`Edit ${role}`}><Button variant="outline" asChild><Link to={`/staff/${slug}`}><ArrowLeft /> Back</Link></Button></TopBar><Card className="mx-auto max-w-2xl"><CardHeader><CardTitle>Account details</CardTitle><CardDescription>Leave the password blank to keep the current password.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="First name"><Input required minLength={2} value={form.firstName} onChange={(e) => update('firstName', e.target.value)} /></Field><Field label="Last name"><Input required minLength={2} value={form.lastName} onChange={(e) => update('lastName', e.target.value)} /></Field><Field label="Email"><Input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></Field><Field label="Phone"><Input required pattern="[0-9]{10}" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></Field><Field label="NIC"><Input required value={form.nic} onChange={(e) => update('nic', e.target.value)} /></Field><Field label="Date of birth"><Input required type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} /></Field><Field label="Gender"><select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={form.gender} onChange={(e) => update('gender', e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></Field><Field label="New password (optional)"><Input type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} /></Field></div><Button className="w-full">Save changes</Button></form></CardContent></Card></div>
}

function Field({ label, children }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div> }
