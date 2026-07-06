import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
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
import { downloadHospitalBill } from "@/lib/downloadBill";

const settings = {
  pharmacy: { title: "Prescription Queue", load: getPrescriptions },
  lab: { title: "Lab Test Queue", load: getLabRequests },
  radiology: { title: "Scan Request Queue", load: getRadiologyRequests },
};

// Uses one queue layout for pharmacy, laboratory, and radiology workloads.
export default function ClinicalWorkQueuePage({ type }) {
  const config = settings[type];
  const [records, setRecords] = useState([]);
  const [completedRecords, setCompletedRecords] = useState([]);
  const [forms, setForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    config.load({}).then((result) => {
      if (result.error) setError(result.error);
      else {
        const loadedRecords =
          result.data.prescriptions ??
          result.data.labRequests ??
          result.data.radiologyRequests ??
          [];
        setRecords(
          loadedRecords.filter((record) => record.status === "Pending"),
        );
        const completedStatus = type === "pharmacy" ? "Dispensed" : "Completed";
        setCompletedRecords(
          loadedRecords.filter((record) => record.status === completedStatus),
        );
      }
      setLoading(false);
    });
  }, [config, type]);

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
    if (type === "pharmacy") {
      const dispensed = result.data.prescription;
      setCompletedRecords((current) => [
        {
          ...record,
          ...dispensed,
          patientId: record.patientId,
          doctorId: record.doctorId,
          appointmentId: record.appointmentId,
        },
        ...current,
      ]);
    } else {
      const completed =
        type === "lab" ? result.data.labRequest : result.data.radiologyRequest;
      setCompletedRecords((current) => [
        {
          ...record,
          ...completed,
          patientId: record.patientId,
          doctorId: record.doctorId,
          appointmentId: record.appointmentId,
        },
        ...current,
      ]);
    }
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
          const medicineTotal = calculateMedicineTotal(form);
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
                          min="1"
                          step="1"
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
                          step="1"
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
                          step="1"
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
                          min="1"
                          step="1"
                          value={form.unitPrice ?? ""}
                          onChange={(event) =>
                            update(record._id, "unitPrice", event.target.value)
                          }
                        />
                      </Field>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                        Total
                      </p>
                      <p className="mt-1 text-2xl font-bold text-blue-800">
                        LKR {medicineTotal.toLocaleString()}
                      </p>
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
      {type === "pharmacy" && (
        <DispensedPrescriptionHistory records={completedRecords} />
      )}
      {type !== "pharmacy" && (
        <CompletedRequestHistory type={type} records={completedRecords} />
      )}
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

function calculateMedicineTotal(form) {
  const values = [
    form.dosageQuantity,
    form.frequencyPerDay,
    form.numberOfDays,
    form.unitPrice,
  ].map(Number);

  if (values.some((value) => !Number.isInteger(value) || value <= 0)) return 0;
  return values.reduce((total, value) => total * value, 1);
}

function DispensedPrescriptionHistory({ records }) {
  const [expandedRecords, setExpandedRecords] = useState(() => new Set());

  function toggleRecord(recordId) {
    setExpandedRecords((current) => {
      const next = new Set(current);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  }

  return (
    <section className="mt-10 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Dispensed Prescriptions
        </h2>
        <p className="text-sm text-slate-500">
          Previously completed prescriptions remain available for review.
        </p>
      </div>
      {records.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            No prescriptions have been dispensed yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {records.map((record) => {
            const patient =
              record.patientId ?? record.appointmentId?.guestPatient;
            const expanded = expandedRecords.has(record._id);
            return (
              <Card key={record._id} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>
                        {patient
                          ? `${patient.firstName} ${patient.lastName}`
                          : "Guest patient"}
                      </CardTitle>
                      {expanded && (
                        <CardDescription>
                          {record.dispensedAt
                            ? new Date(record.dispensedAt).toLocaleString()
                            : "Dispensed"}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {expanded && (
                        <Badge className="bg-blue-600">Dispensed</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadPrescriptionBill(record)}
                      >
                        <Download /> Bill
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRecord(record._id)}
                      >
                        {expanded ? <ChevronUp /> : <ChevronDown />}
                        {expanded ? "Collapse" : "Expand"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expanded && (
                  <CardContent className="space-y-3">
                    <Info
                      label="Doctor instructions"
                      value={
                        record.instructions || "No additional instructions"
                      }
                    />
                    {record.medicines?.map((medicine) => (
                      <div key={medicine._id} className="rounded-md border p-3">
                        <p className="font-medium text-slate-900">
                          {medicine.medicineName}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {medicine.dosageQuantity} dosage ×{" "}
                          {medicine.frequencyPerDay}
                          {" times/day × "}
                          {medicine.numberOfDays} days × LKR{" "}
                          {medicine.unitPrice}
                        </p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-md bg-blue-50 p-3">
                      <span className="font-medium text-blue-700">
                        Grand total
                      </span>
                      <span className="text-lg font-bold text-blue-800">
                        LKR {Number(record.grandTotal ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CompletedRequestHistory({ type, records }) {
  const [expandedRecords, setExpandedRecords] = useState(() => new Set());
  const label = type === "lab" ? "Completed Lab Tests" : "Completed Scans";

  function toggleRecord(recordId) {
    setExpandedRecords((current) => {
      const next = new Set(current);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  }

  return (
    <section className="mt-10 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{label}</h2>
        <p className="text-sm text-slate-500">
          Completed records and their downloadable bills.
        </p>
      </div>
      {records.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            No completed records yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {records.map((record) => {
            const patient = patientForRecord(record);
            const expanded = expandedRecords.has(record._id);
            return (
              <Card key={record._id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{patient}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadRequestBill(type, record)}
                      >
                        <Download /> Bill
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRecord(record._id)}
                      >
                        {expanded ? <ChevronUp /> : <ChevronDown />}
                        {expanded ? "Collapse" : "Expand"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expanded && (
                  <CardContent className="space-y-3">
                    <Info
                      label={type === "lab" ? "Test" : "Scan"}
                      value={type === "lab" ? record.testName : record.scanType}
                    />
                    <Info
                      label={type === "lab" ? "Result" : "Report"}
                      value={type === "lab" ? record.result : record.report}
                    />
                    <div className="flex items-center justify-between rounded-md bg-blue-50 p-3">
                      <span className="font-medium text-blue-700">Total</span>
                      <span className="text-lg font-bold text-blue-800">
                        LKR {Number(record.price ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function downloadPrescriptionBill(record) {
  downloadHospitalBill({
    title: "Pharmacy Bill",
    billNumber: record._id,
    patientName: patientForRecord(record),
    meta: [
      { label: "Doctor", value: doctorForRecord(record) },
      {
        label: "Dispensed at",
        value: record.dispensedAt
          ? new Date(record.dispensedAt).toLocaleString()
          : "Completed",
      },
    ],
    lineItems: (record.medicines ?? []).map((medicine) => ({
      description: `${medicine.medicineName} · ${medicine.dosageQuantity} × ${medicine.frequencyPerDay} × ${medicine.numberOfDays}`,
      amount: medicine.total,
    })),
    total: record.grandTotal,
  });
}

function downloadRequestBill(type, record) {
  const isLab = type === "lab";
  downloadHospitalBill({
    title: isLab ? "Lab Test Bill" : "Radiology Bill",
    billNumber: record._id,
    patientName: patientForRecord(record),
    meta: [
      { label: "Doctor", value: doctorForRecord(record) },
      {
        label: "Completed at",
        value: record.completedAt
          ? new Date(record.completedAt).toLocaleString()
          : "Completed",
      },
    ],
    lineItems: [
      {
        description: isLab ? record.testName : record.scanType,
        amount: record.price,
      },
    ],
    total: record.price,
  });
}

function patientForRecord(record) {
  const patient = record.patientId ?? record.appointmentId?.guestPatient;
  return patient ? `${patient.firstName} ${patient.lastName}` : "Guest patient";
}

function doctorForRecord(record) {
  return `Dr. ${record.doctorId?.firstName ?? ""} ${
    record.doctorId?.lastName ?? ""
  }`;
}
