import { useEffect, useState } from "react";
import { toast } from "sonner";
import TopBar from "@/components/layout/TopBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  completeLabRequest,
  completeRadiologyRequest,
  dispensePrescription,
  getLabRequests,
  getPrescriptions,
  getRadiologyRequests,
} from "@/services/clinicalService";

const settings = {
  pharmacy: { title: "Prescription Queue", load: getPrescriptions },
  lab: { title: "Lab Test Queue", load: getLabRequests },
  radiology: { title: "Scan Request Queue", load: getRadiologyRequests },
};

// Uses one queue layout for pharmacy, laboratory, and radiology workloads.
export default function ClinicalWorkQueuePage({ type }) {
  const config = settings[type];
  const [records, setRecords] = useState([]);
  const [forms, setForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    config.load({ status: "Pending" }).then((result) => {
      if (result.error) setError(result.error);
      else
        setRecords(
          result.data.prescriptions ??
            result.data.labRequests ??
            result.data.radiologyRequests ??
            [],
        );
      setLoading(false);
    });
  }, [config]);

  const update = (id, field, value) =>
    setForms((current) => ({
      ...current,
      [id]: { ...current[id], [field]: value },
    }));

  async function complete(record) {
    // Each role submits the payload required by its protected completion endpoint.
    const form = forms[record._id] ?? {};
    let result;
    if (type === "pharmacy") {
      result = await dispensePrescription(record._id, {
        medicines: [
          {
            medicineName: form.medicineName,
            dosageQuantity: Number(form.dosageQuantity),
            frequencyPerDay: Number(form.frequencyPerDay),
            numberOfDays: Number(form.numberOfDays),
            unitPrice: Number(form.unitPrice),
          },
        ],
      });
    } else if (type === "lab") {
      result = await completeLabRequest(record._id, {
        result: form.result,
        price: Number(form.price),
      });
    } else {
      result = await completeRadiologyRequest(record._id, {
        report: form.report,
        price: Number(form.price),
      });
    }
    if (result.error) return toast.error(result.error);
    setRecords((current) => current.filter((item) => item._id !== record._id));
    toast.success(
      type === "pharmacy" ? "Prescription dispensed" : "Request completed",
    );
  }

  return (
    <div>
      <TopBar title={config.title} />
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      )}
      {!loading && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!loading && !error && records.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No pending requests.
          </CardContent>
        </Card>
      )}
      <div className="grid gap-5 xl:grid-cols-2">
        {records.map((record) => {
          const patient =
            record.patientId ?? record.appointmentId?.guestPatient;
          const form = forms[record._id] ?? {};
          return (
            <Card key={record._id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>
                      {patient
                        ? `${patient.firstName} ${patient.lastName}`
                        : "Guest patient"}
                    </CardTitle>
                    <CardDescription>
                      Dr. {record.doctorId?.firstName}{" "}
                      {record.doctorId?.lastName}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{record.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {type === "pharmacy" && (
                  <>
                    <Info
                      label="Doctor instructions"
                      value={
                        record.instructions || "No additional instructions"
                      }
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Medicine">
                        <Input
                          required
                          value={form.medicineName ?? ""}
                          onChange={(event) =>
                            update(
                              record._id,
                              "medicineName",
                              event.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Dosage quantity">
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={form.dosageQuantity ?? ""}
                          onChange={(event) =>
                            update(
                              record._id,
                              "dosageQuantity",
                              event.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Times per day">
                        <Input
                          type="number"
                          min="1"
                          value={form.frequencyPerDay ?? ""}
                          onChange={(event) =>
                            update(
                              record._id,
                              "frequencyPerDay",
                              event.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Number of days">
                        <Input
                          type="number"
                          min="1"
                          value={form.numberOfDays ?? ""}
                          onChange={(event) =>
                            update(
                              record._id,
                              "numberOfDays",
                              event.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Unit price">
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={form.unitPrice ?? ""}
                          onChange={(event) =>
                            update(record._id, "unitPrice", event.target.value)
                          }
                        />
                      </Field>
                    </div>
                    <Button className="w-full" onClick={() => complete(record)}>
                      Dispense prescription
                    </Button>
                  </>
                )}
                {type === "lab" && (
                  <>
                    <Info label="Requested test" value={record.testName} />
                    <Info
                      label="Instructions"
                      value={
                        record.instructions || "No additional instructions"
                      }
                    />
                    <Field label="Lab result">
                      <TextArea
                        value={form.result ?? ""}
                        onChange={(event) =>
                          update(record._id, "result", event.target.value)
                        }
                      />
                    </Field>
                    <Field label="Price">
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.price ?? ""}
                        onChange={(event) =>
                          update(record._id, "price", event.target.value)
                        }
                      />
                    </Field>
                    <Button className="w-full" onClick={() => complete(record)}>
                      Complete lab request
                    </Button>
                  </>
                )}
                {type === "radiology" && (
                  <>
                    <Info label="Requested scan" value={record.scanType} />
                    <Info
                      label="Instructions"
                      value={
                        record.instructions || "No additional instructions"
                      }
                    />
                    <Field label="Radiology report">
                      <TextArea
                        value={form.report ?? ""}
                        onChange={(event) =>
                          update(record._id, "report", event.target.value)
                        }
                      />
                    </Field>
                    <Field label="Price">
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.price ?? ""}
                        onChange={(event) =>
                          update(record._id, "price", event.target.value)
                        }
                      />
                    </Field>
                    <Button className="w-full" onClick={() => complete(record)}>
                      Complete scan request
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
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
function Info({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-800">{value}</p>
    </div>
  );
}
function TextArea(props) {
  return (
    <textarea
      className="min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm"
      {...props}
    />
  );
}
