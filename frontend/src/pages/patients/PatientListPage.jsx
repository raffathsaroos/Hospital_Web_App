import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import PatientTable from '@/components/patients/PatientTable'
import DeletePatientDialog from '@/components/patients/DeletePatientDialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getPatients,
  deletePatient,
  setPatientStatus,
} from '@/services/patientService'

// Manages the patient list, status changes, and deletion flow.
export default function PatientListPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    // Loads the patient table when the page first opens.
    async function fetchPatients() {
      const { data, error } = await getPatients()
      if (error) {
        setError(error)
      } else {
        setPatients(data.patients)
      }
      setLoading(false)
    }
    fetchPatients()
  }, [])

  // Deletes the selected patient and removes its table row.
  async function handleDelete(id) {
    setDeleteLoading(true)
    const { error } = await deletePatient(id)
    if (error) {
      toast.error(error)
    } else {
      setPatients((prev) => prev.filter((p) => p._id !== id))
      toast.success('Patient deleted successfully')
    }
    setDeleteLoading(false)
    setDeleteTarget(null)
  }

  // Updates a patient's active state without reloading the page.
  async function handleToggleStatus(id, currentIsActive) {
    const { data, error } = await setPatientStatus(id, !currentIsActive)
    if (error) {
      toast.error(error)
    } else {
      setPatients((prev) =>
        prev.map((p) => (p._id === id ? data.patient : p))
      )
      toast.success(
        `Patient ${!currentIsActive ? 'activated' : 'deactivated'}`
      )
    }
  }

  // Finds the selected name shown in the delete warning.
  const deletePatientName = deleteTarget
    ? (() => {
        const p = patients.find((p) => p._id === deleteTarget)
        return p ? `${p.user.firstName} ${p.user.lastName}` : ''
      })()
    : ''

  return (
    <div>
      <TopBar title="Patients">
        <Button asChild>
          <Link to="/patients/register">
            <UserPlus className="mr-2 h-4 w-4" />
            Register Patient
          </Link>
        </Button>
      </TopBar>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && patients.length === 0 && (
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-muted-foreground">No patients registered yet.</p>
            <Button asChild>
              <Link to="/patients/register">Register your first patient</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && patients.length > 0 && (
        <PatientTable
          patients={patients}
          onDelete={setDeleteTarget}
          onToggleStatus={handleToggleStatus}
        />
      )}

      <DeletePatientDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        patientName={deletePatientName}
        onConfirm={() => handleDelete(deleteTarget)}
        loading={deleteLoading}
      />
    </div>
  )
}
