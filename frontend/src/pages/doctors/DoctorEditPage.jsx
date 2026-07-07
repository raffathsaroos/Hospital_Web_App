import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { getDoctorForAdmin, updateDoctor } from "@/services/doctorService";

const departments = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "General Medicine",
  "General Surgery",
  "Obstetrics and Gynecology",
  "Dermatology",
  "ENT",
  "Ophthalmology",
  "Psychiatry",
  "Urology",
  "Nephrology",
  "Oncology",
  "Emergency Medicine",
  "Anesthesiology",
];

export default function DoctorEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    getDoctorForAdmin(id).then((result) => {
      if (result.error) return setError(result.error);
      const doctor = result.data.doctor;
      setForm({
        firstName: doctor.userId.firstName,
        lastName: doctor.userId.lastName,
        email: doctor.userId.email,
        phone: doctor.userId.phone,
        nic: doctor.userId.nic,
        dob: doctor.userId.dob?.split("T")[0] ?? "",
        gender: doctor.userId.gender,
        department: doctor.department,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        isAvailable: doctor.isAvailable,
      });
    });
  }, [id]);

  async function submit(event) {
    event.preventDefault();
    const result = await updateDoctor(id, {
      ...form,
      experience: Number(form.experience),
      consultationFee: Number(form.consultationFee),
    });
    if (result.error) return toast.error(result.error);
    toast.success("Doctor updated successfully");
    navigate("/doctors");
  }

  if (error)
    return (
      <Alert className="border-orange-300 bg-orange-50">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  if (!form) return <p className="text-sm text-slate-500">Loading doctor...</p>;
  return (
    <div>
      <TopBar title="Edit Doctor">
        <Button variant="outline" asChild>
          <Link to="/doctors">
            <ArrowLeft /> Back
          </Link>
        </Button>
      </TopBar>
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Doctor details</CardTitle>
          <CardDescription>
            Update account and professional information. Status is managed from
            the doctor list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-6">
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
              <Field label="Email">
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </Field>
              <Field label="Phone">
                <Input
                  required
                  pattern="[0-9]{10}"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </Field>
              <Field label="NIC">
                <Input
                  required
                  value={form.nic}
                  onChange={(e) => update("nic", e.target.value)}
                />
              </Field>
              <Field label="Date of birth">
                <Input
                  required
                  type="date"
                  value={form.dob}
                  onChange={(e) => update("dob", e.target.value)}
                />
              </Field>
              <Field label="Gender">
                <Select
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Select>
              </Field>
              <Field label="Department">
                <Select
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                >
                  {departments.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Specialization">
                <Input
                  required
                  value={form.specialization}
                  onChange={(e) => update("specialization", e.target.value)}
                />
              </Field>
              <Field label="License number">
                <Input
                  required
                  value={form.licenseNumber}
                  onChange={(e) => update("licenseNumber", e.target.value)}
                />
              </Field>
              <Field label="Experience">
                <Input
                  required
                  type="number"
                  min="0"
                  value={form.experience}
                  onChange={(e) => update("experience", e.target.value)}
                />
              </Field>
              <Field label="Consultation fee">
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.consultationFee}
                  onChange={(e) => update("consultationFee", e.target.value)}
                />
              </Field>
            </div>
            <Button className="w-full">Save changes</Button>
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
function Select(props) {
  return (
    <select
      className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
      {...props}
    />
  );
}
