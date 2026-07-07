import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import TopBar from '@/components/layout/TopBar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { getAppointments, updateAppointmentStatus } from '@/services/appointmentService'

const roleActions = {
  Admin: { Pending: ['Confirmed', 'Rejected'], Confirmed: ['Paid', 'Cancelled'], Paid: ['InQueue', 'Cancelled'], InQueue: ['Diagnosed', 'Cancelled'] },
  Receptionist: { Pending: ['Confirmed', 'Rejected'], Confirmed: ['Paid', 'Cancelled'], Paid: ['InQueue', 'Cancelled'] },
  Doctor: { Pending: ['Rejected'], InQueue: ['Diagnosed'] },
  Patient: { Pending: ['Cancelled'], Confirmed: ['Cancelled'] },
}

const appointmentCategories = ['Pending', 'Confirmed', 'Rejected', 'Paid', 'Diagnosed']

export default function AppointmentListPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [appointmentCategory, setAppointmentCategory] = useState('Pending')

  useEffect(() => {
    async function load() {
      const result = await getAppointments({ limit: 100 })
      if (result.error) setError(result.error)
      else setAppointments(result.data.appointments ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const orderedAppointments = useMemo(() => [...appointments].sort((a, b) => {
    const dateDifference = new Date(a.appointmentDate) - new Date(b.appointmentDate)
    return dateDifference || a.timeSlot.localeCompare(b.timeSlot)
  }), [appointments])

  const usesCategories = ['Admin', 'Receptionist'].includes(user?.role)
  const displayedAppointments = useMemo(() => {
    if (!usesCategories) return orderedAppointments
    return orderedAppointments.filter((appointment) => appointment.status === appointmentCategory)
  }, [appointmentCategory, orderedAppointments, usesCategories])

  async function changeStatus(appointment, status) {
    const warning = status === 'Cancelled'
      ? 'Are you sure you want to cancel this appointment?'
      : status === 'Paid'
        ? 'Are you sure you want to mark this appointment as paid?'
        : `Are you sure you want to mark this appointment as ${status.toLowerCase()}?`
    if (!window.confirm(warning)) return

    let rejectionReason
    if (status === 'Rejected') {
      rejectionReason = window.prompt('Enter a reason for rejecting this appointment:')?.trim()
      if (!rejectionReason) return
    }

    const result = await updateAppointmentStatus(appointment._id, { status, ...(rejectionReason ? { rejectionReason } : {}) })
    if (result.error) return toast.error(result.error)
    setAppointments((current) => current.map((item) => item._id === appointment._id ? result.data.appointment : item))
    toast.success(`Appointment marked as ${status.toLowerCase()}`)
  }

  return (
    <div>
      <TopBar title={user?.role === 'Doctor' ? 'Doctor Queue' : 'Appointments'} />
      {loading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton className="h-24" key={index} />)}</div>}
      {!loading && error && <Alert className="border-orange-300 bg-orange-50"><AlertDescription>{error}</AlertDescription></Alert>}
      {!loading && !error && usesCategories && (
        <div className="mb-5 flex flex-wrap gap-2 rounded-lg border bg-white p-3">
          {appointmentCategories.map((category) => {
            const count = orderedAppointments.filter((appointment) => appointment.status === category).length
            return <Button key={category} variant={appointmentCategory === category ? 'default' : 'outline'} onClick={() => setAppointmentCategory(category)}>{category} ({count})</Button>
          })}
        </div>
      )}
      {!loading && !error && displayedAppointments.length === 0 && <Card><CardContent className="flex flex-col items-center py-12 text-center text-slate-500"><CalendarDays className="mb-3 h-8 w-8 text-blue-500" />{usesCategories ? `No ${appointmentCategory.toLowerCase()} appointments are available.` : 'No appointments are available.'}</CardContent></Card>}
      <div className="space-y-3">
        {displayedAppointments.map((appointment) => {
          const patient = appointment.patientId ?? appointment.guestPatient
          const doctor = appointment.doctorId
          const actions = roleActions[user?.role]?.[appointment.status] ?? []
          return <Card key={appointment._id} className="border-slate-200"><CardContent className="grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center"><div><p className="font-semibold text-slate-900">{patient ? `${patient.firstName} ${patient.lastName}` : 'Guest patient'}</p><p className="text-sm text-slate-500">{appointment.department} · {appointment.appointmentType}</p></div><div className="text-sm text-slate-600"><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-600" />{new Date(appointment.appointmentDate).toLocaleDateString()}</p><p className="mt-1 flex items-center gap-2"><Clock3 className="h-4 w-4 text-orange-600" />{appointment.timeSlot}</p></div><div><p className="text-sm text-slate-500">Dr. {doctor?.firstName} {doctor?.lastName}</p><Badge variant="outline" className={appointment.status === 'Pending' ? 'mt-2 border-orange-300 bg-orange-50 text-orange-700' : 'mt-2 border-blue-300 bg-blue-50 text-blue-700'}>{appointment.status}</Badge></div><div className="flex flex-wrap justify-end gap-2">{actions.map((status) => <Button key={status} size="sm" variant={status === 'Rejected' || status === 'Cancelled' ? 'outline' : 'default'} onClick={() => changeStatus(appointment, status)}>{['Confirmed', 'Paid', 'InQueue', 'Diagnosed'].includes(status) ? <CheckCircle2 /> : <XCircle />}{status}</Button>)}</div></CardContent></Card>
        })}
      </div>
    </div>
  )
}
