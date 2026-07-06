import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import PatientTable from "@/components/patients/PatientTable";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmActionDialog from "@/components/ui/confirm-action-dialog";
import { getPatients, setPatientStatus } from "@/services/patientService";

// Manages the patient list, status changes, and deletion flow.
export default function PatientListPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientToDeactivate, setPatientToDeactivate] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Loads the patient table when the page first opens.
    async function fetchPatients() {
      const { data, error } = await getPatients();
      if (error) {
        setError(error);
      } else {
        setPatients(data.patients);
      }
      setLoading(false);
    }
    fetchPatients();
  }, []);

  // Updates a patient's active state without reloading the page.
  async function handleToggleStatus(id, currentIsActive) {
    if (currentIsActive) {
      const patient = patients.find((item) => item._id === id);
      setPatientToDeactivate(patient);
      return;
    }
    await saveStatus(id, currentIsActive);
  }

  async function saveStatus(id, currentIsActive) {
    const { data, error } = await setPatientStatus(id, !currentIsActive);
    if (error) {
      toast.error(error);
    } else {
      setPatients((prev) => prev.map((p) => (p._id === id ? data.patient : p)));
      toast.success(
        `Patient ${!currentIsActive ? "activated" : "deactivated"}`,
      );
    }
  }

  async function confirmDeactivation() {
    setActionLoading(true);
    await saveStatus(patientToDeactivate._id, true);
    setActionLoading(false);
    setPatientToDeactivate(null);
  }

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
        <PatientTable patients={patients} onToggleStatus={handleToggleStatus} />
      )}
      <ConfirmActionDialog
        open={Boolean(patientToDeactivate)}
        onOpenChange={(open) => !open && setPatientToDeactivate(null)}
        title="Deactivate patient?"
        description={`${patientToDeactivate?.user?.firstName ?? ""} ${
          patientToDeactivate?.user?.lastName ?? ""
        } will no longer be able to sign in.`}
        confirmLabel="Deactivate Patient"
        onConfirm={confirmDeactivation}
        loading={actionLoading}
      />
    </div>
  );
}
