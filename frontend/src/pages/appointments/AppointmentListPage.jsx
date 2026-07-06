import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { toast } from "sonner";
import TopBar from "@/components/layout/TopBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmActionDialog from "@/components/ui/confirm-action-dialog";
import { useAuth } from "@/context/AuthContext";
import {
  getAppointments,
  updateAppointmentStatus,
} from "@/services/appointmentService";

const roleActions = {
  Admin: {
    Pending: ["Confirmed", "Rejected"],
    Confirmed: ["Paid", "Cancelled"],
    Paid: ["Cancelled"],
  },
  Receptionist: {
    Pending: ["Confirmed", "Rejected"],
    Confirmed: ["Paid", "Cancelled"],
    Paid: ["Cancelled"],
  },
  Doctor: { Pending: ["Rejected"] },
  Patient: { Pending: ["Cancelled"], Confirmed: ["Cancelled"] },
};

// Presents only the status transitions permitted for the signed-in user's role.
export default function AppointmentListPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getAppointments({ limit: 100 });
      if (result.error) setError(result.error);
      else setAppointments(result.data.appointments ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const orderedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) => {
        const dateDifference =
          new Date(a.appointmentDate) - new Date(b.appointmentDate);
        return dateDifference || a.timeSlot.localeCompare(b.timeSlot);
      }),
    [appointments],
  );

  async function performStatusChange(appointment, status, reason = "") {
    const result = await updateAppointmentStatus(appointment._id, {
      status,
      ...(reason ? { rejectionReason: reason } : {}),
    });
    if (result.error) return toast.error(result.error);
    setAppointments((current) =>
      current.map((item) =>
        item._id === appointment._id ? result.data.appointment : item,
      ),
    );
    toast.success(`Appointment marked as ${status.toLowerCase()}`);
  }

  function changeStatus(appointment, status) {
    // Destructive transitions pause for the shared confirmation dialog.
    if (status === "Cancelled" || status === "Rejected") {
      setRejectionReason("");
      setPendingAction({ appointment, status });
      return;
    }
    performStatusChange(appointment, status);
  }

  async function confirmDestructiveAction() {
    setActionLoading(true);
    await performStatusChange(
      pendingAction.appointment,
      pendingAction.status,
      rejectionReason.trim(),
    );
    setActionLoading(false);
    setPendingAction(null);
  }

  return (
    <div>
      <TopBar
        title={user?.role === "Doctor" ? "Doctor Queue" : "Appointments"}
      />
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-24" key={index} />
          ))}
        </div>
      )}
      {!loading && error && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!loading && !error && orderedAppointments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center text-slate-500">
            <CalendarDays className="mb-3 h-8 w-8 text-blue-500" />
            No appointments are available.
          </CardContent>
        </Card>
      )}
      <div className="space-y-3">
        {orderedAppointments.map((appointment) => {
          const patient = appointment.patientId ?? appointment.guestPatient;
          const doctor = appointment.doctorId;
          const actions = roleActions[user?.role]?.[appointment.status] ?? [];
          return (
            <Card key={appointment._id} className="border-slate-200">
              <CardContent className="grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center">
                <div>
                  <p className="font-semibold text-slate-900">
                    {patient
                      ? `${patient.firstName} ${patient.lastName}`
                      : "Guest patient"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {appointment.department} · {appointment.appointmentType}
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </p>
                  <p className="mt-1 flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-orange-600" />
                    {appointment.timeSlot}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">
                    Dr. {doctor?.firstName} {doctor?.lastName}
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      appointment.status === "Pending"
                        ? "mt-2 border-orange-300 bg-orange-50 text-orange-700"
                        : "mt-2 border-blue-300 bg-blue-50 text-blue-700"
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {user?.role === "Doctor" &&
                    ["Paid", "Diagnosed"].includes(appointment.status) && (
                      <Button asChild size="sm">
                        <Link to={`/clinical/${appointment._id}`}>
                          Clinical report
                        </Link>
                      </Button>
                    )}
                  {actions.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={
                        status === "Rejected" || status === "Cancelled"
                          ? "outline"
                          : "default"
                      }
                      onClick={() => changeStatus(appointment, status)}
                    >
                      {["Confirmed", "Paid", "Diagnosed"].includes(status) ? (
                        <CheckCircle2 />
                      ) : (
                        <XCircle />
                      )}
                      {status}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <ConfirmActionDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={
          pendingAction?.status === "Rejected"
            ? "Reject appointment?"
            : "Are you sure you want to cancel?"
        }
        description={
          pendingAction?.status === "Rejected"
            ? "This appointment will be rejected and removed from the active booking workflow."
            : undefined
        }
        confirmLabel={
          pendingAction?.status === "Rejected" ? "Reject Appointment" : "Yes"
        }
        cancelLabel={
          pendingAction?.status === "Rejected" ? "Keep unchanged" : "No"
        }
        onConfirm={confirmDestructiveAction}
        loading={actionLoading}
        reasonLabel={
          pendingAction?.status === "Rejected"
            ? "Reason for rejection"
            : undefined
        }
        reason={rejectionReason}
        onReasonChange={setRejectionReason}
      />
    </div>
  );
}
