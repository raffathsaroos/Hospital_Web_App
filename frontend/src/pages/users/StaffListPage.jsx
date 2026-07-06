import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, ToggleLeft, ToggleRight, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import TopBar from '@/components/layout/TopBar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getUsers, setUserStatus } from '@/services/userService'

export default function StaffListPage({ role, slug }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { getUsers(role).then((result) => { if (result.error) setError(result.error); else setUsers(result.data.users ?? []); setLoading(false) }) }, [role])

  async function toggleStatus(user) {
    const next = !user.isActive
    if (!window.confirm(`Are you sure you want to ${next ? 'activate' : 'mark'} this ${role.toLowerCase()} ${next ? '' : 'as inactive'}?`)) return
    const result = await setUserStatus(user.id, next)
    if (result.error) return toast.error(result.error)
    setUsers((current) => current.map((item) => item.id === user.id ? result.data.user : item))
    toast.success(`${role} ${next ? 'activated' : 'marked inactive'}`)
  }

  return <div><TopBar title={`${role}s`}><Button asChild><Link to={`/staff/${slug}/add`}><UserPlus /> Add {role}</Link></Button></TopBar>{loading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-14" />)}</div>}{!loading && error && <Alert className="border-orange-300 bg-orange-50"><AlertDescription>{error}</AlertDescription></Alert>}{!loading && !error && users.length === 0 && <Card><CardContent className="flex flex-col items-center py-12 text-slate-500"><Users className="mb-3 text-blue-600" />No {role.toLowerCase()} accounts have been added.</CardContent></Card>}{!loading && !error && users.length > 0 && <div className="overflow-hidden rounded-lg border bg-white"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>NIC</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{users.map((user) => <TableRow key={user.id}><TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell><TableCell>{user.email}</TableCell><TableCell>{user.phone}</TableCell><TableCell>{user.nic}</TableCell><TableCell><Badge variant="outline" className={user.isActive ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-orange-300 bg-orange-50 text-orange-700'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" asChild><Link to={`/staff/${slug}/${user.id}/edit`}><Edit className="text-slate-600" /></Link></Button><Button variant="ghost" size="icon" onClick={() => toggleStatus(user)}>{user.isActive ? <ToggleRight className="text-blue-600" /> : <ToggleLeft className="text-orange-600" />}</Button></div></TableCell></TableRow>)}</TableBody></Table></div>}</div>
}
