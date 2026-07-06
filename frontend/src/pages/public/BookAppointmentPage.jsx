import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarCheck, Clock, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import PublicHeader from "@/components/public/PublicHeader";
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
import { getDoctorById } from "@/services/doctorService";
import { createPublicAppointment } from "@/services/appointmentService";

const initialForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  appointmentDate: "",
  timeSlot: "",
  appointmentType: "OPD",
  notes: "",
};

function makeSlots(window) {
  const toMinutes = (value) => {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  };
  const format = (minutes) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  const slots = [];
  for (
    let start = toMinutes(window.startTime);
    start + window.slotDurationMinutes <= toMinutes(window.endTime);
    start += window.slotDurationMinutes
  )
    slots.push(
      `${format(start)} - ${format(start + window.slotDurationMinutes)}`,
    );
  return slots;
}

export default function BookAppointmentPage() {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => ({
    ...initialForm,
    appointmentDate: searchParams.get("date") ?? "",
    timeSlot: searchParams.get("time") ?? "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    getDoctorById(doctorId).then(({ data, error: requestError }) =>
      requestError ? setError(requestError) : setDoctor(data.doctor),
    );
  }, [doctorId]);
  const selectedDay = form.appointmentDate
    ? new Date(`${form.appointmentDate}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
      })
    : "";
  // Expand schedule windows into appointment-sized choices for the selected day.
  const availableSlots = useMemo(
    () =>
      doctor?.availableTimeSlots
        ?.filter((item) => item.day === selectedDay)
        .flatMap(makeSlots) ?? [],
    [doctor, selectedDay],
  );
  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "appointmentDate" ? { timeSlot: "" } : {}),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    const { data, error: requestError } = await createPublicAppointment({
      doctorId: doctor.userId._id,
      appointmentDate: form.appointmentDate,
      timeSlot: form.timeSlot,
      appointmentType: form.appointmentType,
      notes: form.notes,
      guestPatient: {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        ...(form.email ? { email: form.email } : {}),
      },
    });
    setSubmitting(false);
    if (requestError) return toast.error(requestError);
    setConfirmed(data.appointment);
    toast.success("Appointment request submitted");
  }

  if (confirmed)
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicHeader />
        <main className="mx-auto max-w-xl px-5 py-16">
          <Card className="border-blue-200">
            <CardContent className="flex flex-col items-center p-10 text-center">
              <div className="rounded-full bg-blue-100 p-5 text-blue-700">
                <CalendarCheck className="h-10 w-10" />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-slate-900">
                Appointment requested
              </h1>
              <p className="mt-2 text-slate-600">
                Your request is pending hospital confirmation. Keep this
                reference for your records.
              </p>
              <p className="mt-5 rounded-lg bg-orange-50 px-4 py-2 font-mono text-sm text-orange-700">
                {confirmed._id}
              </p>
              <Button asChild className="mt-7">
                <Link to="/">Return to doctors</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Button variant="ghost" asChild className="mb-5 text-slate-600">
          <Link to="/">
            <ArrowLeft /> Back to doctors
          </Link>
        </Button>
        {error ? (
          <Alert className="border-orange-300 bg-orange-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          doctor && (
            <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
              <Card className="h-fit border-blue-100 bg-blue-700 text-white">
                <CardContent className="p-7">
                  <Stethoscope className="h-9 w-9 text-orange-300" />
                  <h1 className="mt-5 text-2xl font-bold">
                    Dr. {doctor.userId.firstName} {doctor.userId.lastName}
                  </h1>
                  <p className="text-blue-100">{doctor.specialization}</p>
                  <div className="mt-6 space-y-3 text-sm">
                    <p>{doctor.department}</p>
                    <p>{doctor.experience} years experience</p>
                    <p>
                      LKR {Number(doctor.consultationFee).toLocaleString()}{" "}
                      consultation fee
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Request an appointment</CardTitle>
                  <CardDescription>
                    Select a scheduled day and complete your contact details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="First name">
                        <Input
                          required
                          minLength={2}
                          value={form.firstName}
                          onChange={(e) => update("firstName", e.target.value)}
                        />
                      </Field>
                      <Field label="Last name">
                        <Input
                          required
                          minLength={2}
                          value={form.lastName}
                          onChange={(e) => update("lastName", e.target.value)}
                        />
                      </Field>
                      <Field label="Phone">
                        <Input
                          required
                          pattern="[0-9]{10}"
                          placeholder="0771234567"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                        />
                      </Field>
                      <Field label="Email (optional)">
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                        />
                      </Field>
                      <Field label="Appointment date">
                        <Input
                          required
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={form.appointmentDate}
                          onChange={(e) =>
                            update("appointmentDate", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Visit type">
                        <select
                          required
                          className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                          value={form.appointmentType}
                          onChange={(e) =>
                            update("appointmentType", e.target.value)
                          }
                        >
                          <option>OPD</option>
                          <option>IPD</option>
                          <option>Emergency</option>
                        </select>
                      </Field>
                    </div>
                    <div>
                      <Label>Available time</Label>
                      {!form.appointmentDate ? (
                        <p className="mt-2 text-sm text-slate-500">
                          Choose a date to see available times.
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
                              <Clock className="h-4 w-4" />
                              {slot}
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
                        className="min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm"
                        value={form.notes}
                        onChange={(e) => update("notes", e.target.value)}
                      />
                    </Field>
                    <Button
                      className="w-full"
                      disabled={submitting || !form.timeSlot}
                    >
                      {submitting
                        ? "Submitting request..."
                        : "Request appointment"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )
        )}
      </main>
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
