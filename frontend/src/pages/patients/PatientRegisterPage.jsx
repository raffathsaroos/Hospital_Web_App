import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { patientSchema } from "@/schemas/patient.schema";
import { registerPatient } from "@/services/patientService";
import { getAppointmentById } from "@/services/appointmentService";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Collects and validates details for a new patient account.
export default function PatientRegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const [prefillError, setPrefillError] = useState("");

  const form = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nic: "",
      dob: "",
      gender: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!appointmentId) return;

    getAppointmentById(appointmentId).then((result) => {
      if (result.error) {
        setPrefillError(result.error);
        return;
      }
      const appointment = result.data.appointment;
      if (appointment.status !== "Diagnosed" || !appointment.guestPatient) {
        setPrefillError(
          "This appointment is not an eligible diagnosed guest record.",
        );
        return;
      }
      form.reset({
        ...form.getValues(),
        firstName: appointment.guestPatient.firstName ?? "",
        lastName: appointment.guestPatient.lastName ?? "",
        email: appointment.guestPatient.email ?? "",
        phone: appointment.guestPatient.phone ?? "",
      });
    });
  }, [appointmentId, form]);

  // Sends valid form details and returns to the patient list.
  async function onSubmit(values) {
    const { data, error } = await registerPatient({
      ...values,
      ...(appointmentId ? { appointmentId } : {}),
    });
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(
      `${data.patient.user.firstName} ${data.patient.user.lastName} registered successfully`,
    );
    navigate("/patients");
  }

  return (
    <div>
      <TopBar title="Register Patient">
        <Button variant="outline" asChild>
          <Link to="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </TopBar>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>New Patient Registration</CardTitle>
          <CardDescription>
            {appointmentId
              ? "Available guest details are prefilled. Complete the missing required information."
              : "Fill in the patient details below. All fields are required."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prefillError && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{prefillError}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="0771234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIC</FormLabel>
                      <FormControl>
                        <Input placeholder="200012345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Min. 8 characters"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Registering..."
                  : "Register Patient"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
