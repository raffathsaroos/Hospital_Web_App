import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
import { getDoctorById, updateDoctorSchedule } from "@/services/doctorService";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const newSlot = () => ({
  key: crypto.randomUUID(),
  day: "Monday",
  startTime: "09:00",
  endTime: "17:00",
  slotDurationMinutes: 30,
});

export default function DoctorSchedulePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getDoctorById(id).then((result) => {
      if (result.error) setError(result.error);
      else {
        const value = result.data.doctor;
        setDoctor(value);
        setSlots(
          (value.availableTimeSlots ?? []).map((slot) => ({
            ...slot,
            key: crypto.randomUUID(),
          })),
        );
        setIsAvailable(value.isAvailable);
      }
      setLoading(false);
    });
  }, [id]);

  const updateSlot = (key, field, value) =>
    setSlots((current) =>
      current.map((slot) =>
        slot.key === key ? { ...slot, [field]: value } : slot,
      ),
    );
  const removeSlot = (key) =>
    setSlots((current) => current.filter((slot) => slot.key !== key));

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    const availableTimeSlots = slots.map(
      ({ day, startTime, endTime, slotDurationMinutes }) => ({
        day,
        startTime,
        endTime,
        slotDurationMinutes: Number(slotDurationMinutes),
      }),
    );
    const result = await updateDoctorSchedule(id, {
      isAvailable,
      availableTimeSlots,
    });
    setSaving(false);
    if (result.error) return toast.error(result.error);
    toast.success("Doctor schedule updated successfully");
    navigate("/doctor-schedules");
  }

  if (loading)
    return <p className="text-sm text-slate-500">Loading doctor schedule...</p>;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );

  return (
    <div>
      <TopBar title="Manage Doctor Schedule">
        <Button asChild variant="outline">
          <Link to="/doctor-schedules">
            <ArrowLeft /> Back
          </Link>
        </Button>
      </TopBar>
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>
            Dr. {doctor.userId.firstName} {doctor.userId.lastName}
          </CardTitle>
          <CardDescription>
            {doctor.department} · {doctor.specialization}. Add one or more
            working periods for each day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <label className="flex items-center gap-3 rounded-lg border p-4">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(event) => setIsAvailable(event.target.checked)}
                className="h-4 w-4"
              />
              <span>
                <span className="block font-medium">
                  Accepting appointments
                </span>
                <span className="text-sm text-slate-500">
                  Patients can book this doctor during the configured periods.
                </span>
              </span>
            </label>
            <div className="space-y-3">
              {slots.map((slot) => (
                <div
                  key={slot.key}
                  className="grid items-end gap-3 rounded-lg border p-4 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto]"
                >
                  <Field label="Day">
                    <select
                      value={slot.day}
                      onChange={(event) =>
                        updateSlot(slot.key, "day", event.target.value)
                      }
                      className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                    >
                      {weekDays.map((day) => (
                        <option key={day}>{day}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Start">
                    <Input
                      required
                      type="time"
                      value={slot.startTime}
                      onChange={(event) =>
                        updateSlot(slot.key, "startTime", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="End">
                    <Input
                      required
                      type="time"
                      value={slot.endTime}
                      onChange={(event) =>
                        updateSlot(slot.key, "endTime", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Minutes per appointment">
                    <Input
                      required
                      type="number"
                      min="5"
                      max="480"
                      value={slot.slotDurationMinutes}
                      onChange={(event) =>
                        updateSlot(
                          slot.key,
                          "slotDurationMinutes",
                          event.target.value,
                        )
                      }
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Remove time slot"
                    onClick={() => removeSlot(slot.key)}
                  >
                    <Trash2 className="text-red-500" />
                  </Button>
                </div>
              ))}
              {slots.length === 0 && (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                  No time slots configured.
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSlots((current) => [...current, newSlot()])}
            >
              <Plus /> Add time slot
            </Button>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving schedule..." : "Save schedule"}
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
