import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import TopBar from "@/components/layout/TopBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmActionDialog from "@/components/ui/confirm-action-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { downloadHospitalBill } from "@/lib/downloadBill";
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

const receptionistCategories = ["All", "Rejected", "Paid", "Diagnosed"];

function DoctorQueueSections({ appointments, onStatusChange }) {
  const waiting = appointments.filter((appointment) =>
    ["Pending", "Confirmed", "Paid"].includes(appointment.status),
  );
  const diagnosed = appointments.filter(
    (appointment) => appointment.status === "Diagnosed",
  );

  return (
    <div className="space-y-8">
      <DoctorQueueSection
        title="Waiting for Diagnosis"
        description="Active patients who have not been diagnosed yet."
        appointments={waiting}
        emptyMessage="No patients are waiting for diagnosis."
        onStatusChange={onStatusChange}
      />
      <DoctorQueueSection
        title="Diagnosed Patients"
        description="Patients whose consultation and diagnosis are complete."
        appointments={diagnosed}
        emptyMessage="No diagnosed patients are available."
        onStatusChange={onStatusChange}
      />
    </div>
  );
}

function DoctorQueueSection({
  title,
  description,
  appointments,
  emptyMessage,
  onStatusChange,
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {appointments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : (
        appointments.map((appointment) => (
          <DoctorAppointmentCard
            key={appointment._id}
            appointment={appointment}
            onStatusChange={onStatusChange}
          />
        ))
      )}
    </section>
  );
}

function DoctorAppointmentCard({ appointment, onStatusChange }) {
  const patient = appointment.patientId ?? appointment.guestPatient;
  const actions = roleActions.Doctor[appointment.status] ?? [];

  return (
    <Card className="border-slate-200">
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
        <Badge
          variant="outline"
          className="w-fit border-blue-300 bg-blue-50 text-blue-700"
        >
          {appointment.status}
        </Badge>
        <div className="flex flex-wrap justify-end gap-2">
          {appointment.status === "Paid" && (
            <Button asChild size="sm">
              <Link to={`/clinical/${appointment._id}`}>Diagnose patient</Link>
            </Button>
          )}
          {appointment.status === "Diagnosed" && (
            <Button asChild size="sm" variant="outline">
              <Link to="/reports">View report</Link>
            </Button>
          )}
          {actions.map((status) => (
            <Button
              key={status}
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(appointment, status)}
            >
              <XCircle /> {status}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Presents only the status transitions permitted for the signed-in user's role.
export default function AppointmentListPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [receptionistCategory, setReceptionistCategory] = useState("All");

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

  const displayedAppointments = useMemo(() => {
    if (user?.role !== "Receptionist" || receptionistCategory === "All") {
      return orderedAppointments;
    }
    return orderedAppointments.filter(
      (appointment) => appointment.status === receptionistCategory,
    );
  }, [orderedAppointments, receptionistCategory, user?.role]);

  async function performStatusChange(
    appointment,
    status,
    reason = "",
    extra = {},
  ) {
    const result = await updateAppointmentStatus(appointment._id, {
      status,
      ...(reason ? { rejectionReason: reason } : {}),
      ...extra,
    });
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    setAppointments((current) =>
      current.map((item) =>
        item._id === appointment._id ? result.data.appointment : item,
      ),
    );
    toast.success(`Appointment marked as ${status.toLowerCase()}`);
    return true;
  }

  function changeStatus(appointment, status) {
    if (status === "Paid") {
      setRoomNumber("");
      setPaymentAppointment(appointment);
      return;
    }
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

  async function confirmPayment() {
    setActionLoading(true);
    const saved = await performStatusChange(paymentAppointment, "Paid", "", {
      roomNumber: roomNumber.trim(),
    });
    setActionLoading(false);
    if (saved) setPaymentAppointment(null);
  }

  return (
    <div>
      <TopBar title={user?.role === "Doctor" ? "Doctor Queue" : "Appointments"}>
        {["Admin", "Receptionist"].includes(user?.role) && (
          <Button asChild>
            <Link to="/appointments/book">Book Appointment</Link>
          </Button>
        )}
      </TopBar>
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
      {!loading &&
        !error &&
        orderedAppointments.length === 0 &&
        user?.role !== "Doctor" && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center text-slate-500">
              <CalendarDays className="mb-3 h-8 w-8 text-blue-500" />
              No appointments are available.
            </CardContent>
          </Card>
        )}
      {!loading && !error && user?.role === "Receptionist" && (
        <div className="mb-5 flex flex-wrap gap-2 rounded-lg border bg-white p-3">
          {receptionistCategories.map((category) => {
            const count =
              category === "All"
                ? orderedAppointments.length
                : orderedAppointments.filter(
                    (appointment) => appointment.status === category,
                  ).length;
            return (
              <Button
                key={category}
                size="sm"
                variant={
                  receptionistCategory === category ? "default" : "outline"
                }
                onClick={() => setReceptionistCategory(category)}
              >
                {category} ({count})
              </Button>
            );
          })}
        </div>
      )}
      {user?.role === "Doctor" && !loading && !error && (
        <DoctorQueueSections
          appointments={orderedAppointments}
          onStatusChange={changeStatus}
        />
      )}
      {user?.role !== "Doctor" && (
        <div className="space-y-3">
          {displayedAppointments.map((appointment) => {
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
                      {new Date(
                        appointment.appointmentDate,
                      ).toLocaleDateString()}
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
                    {["Admin", "Receptionist"].includes(user?.role) &&
                      ["Paid", "Diagnosed"].includes(appointment.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadAppointmentBill(appointment)}
                        >
                          <Download /> Download Bill
                        </Button>
                      )}
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
          {user?.role === "Receptionist" &&
            displayedAppointments.length === 0 &&
            orderedAppointments.length > 0 && (
              <Card>
                <CardContent className="py-10 text-center text-slate-500">
                  No {receptionistCategory.toLowerCase()} appointments.
                </CardContent>
              </Card>
            )}
        </div>
      )}
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
      <Dialog
        open={Boolean(paymentAppointment)}
        onOpenChange={(open) => !open && setPaymentAppointment(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Enter the assigned room before marking this appointment as paid.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Room number</Label>
            <Input
              value={roomNumber}
              onChange={(event) => setRoomNumber(event.target.value)}
              placeholder="For example: OPD-03"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentAppointment(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPayment}
              disabled={actionLoading || !roomNumber.trim()}
            >
              {actionLoading ? "Saving..." : "Mark Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function downloadAppointmentBill(appointment) {
  const patient = appointment.patientId ?? appointment.guestPatient;
  const doctor = appointment.doctorId;
  downloadHospitalBill({
    title: "Appointment Bill",
    billNumber: appointment._id,
    patientName: patient
      ? `${patient.firstName} ${patient.lastName}`
      : "Guest patient",
    meta: [
      {
        label: "Doctor",
        value: `Dr. ${doctor?.firstName ?? ""} ${doctor?.lastName ?? ""}`,
      },
      { label: "Room number", value: appointment.roomNumber || "Not assigned" },
      {
        label: "Booking order",
        value: appointment.bookingOrderNumber ?? "Not available",
      },
      {
        label: "Appointment",
        value: `${new Date(appointment.appointmentDate).toLocaleDateString()} · ${appointment.timeSlot}`,
      },
    ],
    lineItems: [
      {
        description: "Doctor consultation",
        amount: appointment.paidAmount ?? 0,
      },
    ],
    total: appointment.paidAmount ?? 0,
  });
}
