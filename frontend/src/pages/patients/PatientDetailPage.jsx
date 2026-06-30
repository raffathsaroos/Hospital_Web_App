import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getPatientById } from '@/services/patientService'

// Displays one label and value in the patient detail grid.
function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

// Loads and displays the full record for one patient.
export default function PatientDetailPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetches the patient named in the current route.
    async function fetch() {
      const { data, error } = await getPatientById(id)
      if (error) setError(error)
      else setPatient(data.patient)
      setLoading(false)
    }
    fetch()
  }, [id])

  return (
    <div>
      <TopBar title="Patient Details">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/patients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          {patient && (
            <Button asChild>
              <Link to={`/patients/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </TopBar>

      {loading && <Skeleton className="h-64 w-full max-w-2xl rounded-lg" />}

      {!loading && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && patient && (
        <Card className="max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>
              {patient.user.firstName} {patient.user.lastName}
            </CardTitle>
            <Badge
              variant="outline"
              className={
                patient.user.isActive
                  ? 'border-green-500 bg-green-50 text-green-600'
                  : 'border-red-400 bg-red-50 text-red-600'
              }
            >
              {patient.user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <DetailRow label="Email" value={patient.user.email} />
              <DetailRow label="Phone" value={patient.user.phone} />
              <DetailRow label="NIC" value={patient.user.nic} />
              <DetailRow label="Gender" value={patient.user.gender} />
              <DetailRow
                label="Date of Birth"
                value={new Date(patient.user.dob).toLocaleDateString()}
              />
              <DetailRow
                label="Registered"
                value={new Date(patient.createdAt).toLocaleDateString()}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
