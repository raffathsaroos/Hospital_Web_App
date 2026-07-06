import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, Stethoscope, ToggleLeft, ToggleRight, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import TopBar from '@/components/layout/TopBar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getDoctorsForAdmin, setDoctorStatus } from '@/services/doctorService'

export default function DoctorListPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { getDoctorsForAdmin().then((result) => { if (result.error) setError(result.error); else setDoctors(result.data.doctors ?? []); setLoading(false) }) }, [])

  async function toggleStatus(doctor) {
    const nextStatus = !doctor.userId.isActive
    if (!window.confirm(`Are you sure you want to ${nextStatus ? 'activate' : 'mark'} this doctor ${nextStatus ? '' : 'as inactive'}?`)) return
    const result = await setDoctorStatus(doctor._id, nextStatus)
    if (result.error) return toast.error(result.error)
    setDoctors((current) => current.map((item) => item._id === doctor._id ? result.data.doctor : item))
    toast.success(`Doctor ${nextStatus ? 'activated' : 'marked inactive'}`)
  }

  return <div><TopBar title="Doctors"><Button asChild><Link to="/doctors/add"><UserPlus /> Add Doctor</Link></Button></TopBar>{loading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-14" />)}</div>}{!loading && error && <Alert className="border-orange-300 bg-orange-50"><AlertDescription>{error}</AlertDescription></Alert>}{!loading && !error && doctors.length === 0 && <Card><CardContent className="flex flex-col items-center py-12 text-slate-500"><Stethoscope className="mb-3 text-blue-600" />No doctors have been added.</CardContent></Card>}{!loading && !error && doctors.length > 0 && <div className="overflow-hidden rounded-lg border bg-white"><Table><TableHeader><TableRow><TableHead>Doctor</TableHead><TableHead>Department</TableHead><TableHead>Specialization</TableHead><TableHead>License</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{doctors.map((doctor) => <TableRow key={doctor._id}><TableCell><p className="font-medium">Dr. {doctor.userId.firstName} {doctor.userId.lastName}</p><p className="text-xs text-slate-500">{doctor.userId.email}</p></TableCell><TableCell>{doctor.department}</TableCell><TableCell>{doctor.specialization}</TableCell><TableCell>{doctor.licenseNumber}</TableCell><TableCell><Badge variant="outline" className={doctor.userId.isActive ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-orange-300 bg-orange-50 text-orange-700'}>{doctor.userId.isActive ? 'Active' : 'Inactive'}</Badge></TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" asChild title="Edit doctor"><Link to={`/doctors/${doctor._id}/edit`}><Edit className="text-slate-600" /></Link></Button><Button variant="ghost" size="icon" title={doctor.userId.isActive ? 'Mark inactive' : 'Activate'} onClick={() => toggleStatus(doctor)}>{doctor.userId.isActive ? <ToggleRight className="text-blue-600" /> : <ToggleLeft className="text-orange-600" />}</Button></div></TableCell></TableRow>)}</TableBody></Table></div>}</div>
}
