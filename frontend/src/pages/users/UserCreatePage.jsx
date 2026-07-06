import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TopBar from "@/components/layout/TopBar";
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
import {
  createDoctor,
  createPatient,
  createUser,
} from "@/services/userService";

const roles = [
  "Admin",
  "Patient",
  "Doctor",
  "Receptionist",
  "Lab Operator",
  "Radiologist",
  "Pharmacist",
];
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
const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  nic: "",
  dob: "",
  gender: "",
  password: "",
  role: "Receptionist",
  department: "",
  specialization: "",
  licenseNumber: "",
  experience: "",
  consultationFee: "",
};

export default function UserCreatePage({ fixedRole }) {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    role: fixedRole ?? initialForm.role,
  }));
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    const common = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      nic: form.nic,
      dob: form.dob,
      gender: form.gender,
      password: form.password,
    };
    let result;
    if (form.role === "Patient") result = await createPatient(common);
    else if (form.role === "Doctor")
      result = await createDoctor({
        ...common,
        department: form.department,
        specialization: form.specialization,
        licenseNumber: form.licenseNumber,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        qualifications: [],
        availableDays: [],
        availableTimeSlots: [],
        isAvailable: false,
      });
    else result = await createUser({ ...common, role: form.role });
    setSubmitting(false);
    if (result.error) return toast.error(result.error);
    toast.success(`${form.role} account created successfully`);
    setForm({ ...initialForm, role: fixedRole ?? initialForm.role });
    if (fixedRole === "Doctor") {
      navigate("/doctors");
    } else if (fixedRole) {
      navigate(`/staff/${roleSlug(fixedRole)}`);
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <div>
      <TopBar title={`Add ${fixedRole ?? "User"}`} />
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Create hospital account</CardTitle>
          <CardDescription>
            The user will sign in using the email and password entered here.
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
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  placeholder="0771234567"
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
                  max={new Date().toISOString().split("T")[0]}
                  value={form.dob}
                  onChange={(e) => update("dob", e.target.value)}
                />
              </Field>
              <Field label="Gender">
                <Select
                  required
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Select>
              </Field>
              {!fixedRole && (
                <Field label="Role">
                  <Select
                    required
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>
            <Field label="Temporary password">
              <Input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Minimum 8 characters. Share it securely with the user.
              </p>
            </Field>
            {form.role === "Doctor" && (
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-5">
                <h3 className="mb-4 font-semibold text-slate-900">
                  Doctor profile
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Department">
                    <Select
                      required
                      value={form.department}
                      onChange={(e) => update("department", e.target.value)}
                    >
                      <option value="">Select department</option>
                      {departments.map((department) => (
                        <option key={department}>{department}</option>
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
                  <Field label="Experience (years)">
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
                      onChange={(e) =>
                        update("consultationFee", e.target.value)
                      }
                    />
                  </Field>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  The doctor starts unavailable until a schedule is configured.
                </p>
              </div>
            )}
            <Button className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : `Create ${form.role}`}
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
function Select(props) {
  return (
    <select
      className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  );
}
function roleSlug(role) {
  return role.toLowerCase().replaceAll(" ", "-");
}
