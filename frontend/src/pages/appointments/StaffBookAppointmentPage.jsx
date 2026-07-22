import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import TopBar from "@/components/layout/TopBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStaffAppointment } from "@/services/appointmentService";
import { getDoctors } from "@/services/doctorService";

const initialForm = {
  doctorId: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  appointmentDate: "",
  timeSlot: "",
  appointmentType: "OPD",
  notes: "",
  notess: "",
};

export default function StaffBookAppointmentPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getDoctors().then((result) => {
      if (result.error) setError(result.error);
      else setDoctors(result.data.doctors ?? []);
      setLoading(false);
    });
  }, []);

  const selectedDoctor = doctors.find(
    (doctor) => doctor.userId._id === form.doctorId,
  );
  const selectedDay = form.appointmentDate
    ? new Date(`${form.appointmentDate}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
      })
    : "";

  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDay) return [];
    return selectedDoctor.availableTimeSlots
      .filter((window) => window.day === selectedDay)
      .flatMap(makeSlots);
  }, [selectedDoctor, selectedDay]);

  const update = (field, value) =>
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "doctorId" || field === "appointmentDate"
        ? { timeSlot: "" }
        : {}),
    }));

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    const result = await createStaffAppointment({
      doctorId: form.doctorId,
      appointmentDate: form.appointmentDate,
      timeSlot: form.timeSlot,
      appointmentType: form.appointmentType,
      notes: form.notes,
      guestPatient: {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email || undefined,
      },
    });
    setSubmitting(false);
    if (result.error) return toast.error(result.error);
    toast.success("Appointment booked successfully");
    navigate("/appointments");
  }

  return (
    <div>
      <TopBar title="Book Appointment">
        <Button variant="outline" asChild>
          <Link to="/appointments">
            <ArrowLeft /> Back
          </Link>
        </Button>
      </TopBar>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Book for a Customer</CardTitle>
          <CardDescription>
            Enter the customer details and select an available doctor time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Doctor">
                <select
                  required
                  disabled={loading}
                  value={form.doctorId}
                  onChange={(event) => update("doctorId", event.target.value)}
                  className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor.userId._id}>
                      Dr. {doctor.userId.firstName} {doctor.userId.lastName} ·{" "}
                      {doctor.department}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Appointment date">
                <Input
                  required
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.appointmentDate}
                  onChange={(event) =>
                    update("appointmentDate", event.target.value)
                  }
                />
              </Field>
              <Field label="First name">
                <Input
                  required
                  minLength={2}
                  value={form.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                />
              </Field>
              <Field label="Last name">
                <Input
                  required
                  minLength={2}
                  value={form.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                />
              </Field>
              <Field label="Phone">
                <Input
                  required
                  pattern="[0-9]{10}"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
              </Field>
              <Field label="Email (optional)">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                />
              </Field>
                
            </div>

            <div>
              <Label>Available time</Label>
              {!form.doctorId || !form.appointmentDate ? (
                <p className="mt-2 text-sm text-slate-500">
                  Choose a doctor and date to see available times.
                </p>
              ) : availableSlots.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => update("timeSlot", slot)}
                      className={[
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                        form.timeSlot === slot
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300",
                      ].join(" ")}
                    >
                      <Clock /> {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 rounded-md bg-orange-50 p-3 text-sm text-orange-700">
                  The doctor has no scheduled times on {selectedDay}.
                </p>
              )}
            </div>

            <Field label="Notes (optional)">
              <textarea
                maxLength={1000}
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                className="min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm"
              />
            </Field>
            <Button className="w-full" disabled={submitting || !form.timeSlot}>
              {submitting ? "Booking appointment..." : "Book Appointment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function makeSlots(window) {
  const toMinutes = (value) => {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const format = (minutes) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
      minutes % 60,
    ).padStart(2, "0")}`;
  const slots = [];
  const end = toMinutes(window.endTime);
  for (
    let start = toMinutes(window.startTime);
    start + window.slotDurationMinutes <= end;
    start += window.slotDurationMinutes
  ) {
    slots.push(
      `${format(start)} - ${format(start + window.slotDurationMinutes)}`,
    );
  }
  return slots;
}
