import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  FlaskConical,
  Pill,
  ScanLine,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getClinicalReports } from "@/services/clinicalService";

// Joins the clinical record types by appointment for one patient visit.
export default function DoctorReportsPage() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState("");
  const [expandedVisits, setExpandedVisits] = useState(() => new Set());

  useEffect(() => {
    getClinicalReports().then((result) => {
      if (result.error) setError(result.error);
      else setReports(result.data);
    });
  }, []);

  const visits = useMemo(() => {
    if (!reports) return [];

    return reports.diagnoses.map((diagnosis) => {
      const appointmentId = recordAppointmentId(diagnosis);
      return {
        appointmentId,
        diagnosis,
        prescription: reports.prescriptions.find(
          (record) => recordAppointmentId(record) === appointmentId,
        ),
        labRequests: reports.labReports.filter(
          (record) => recordAppointmentId(record) === appointmentId,
        ),
        radiologyRequests: reports.radiologyReports.filter(
          (record) => recordAppointmentId(record) === appointmentId,
        ),
		endoscopyRequests: reports.endoscopyReports.filter(
          (record) => recordAppointmentId(record) === appointmentId,
        ),
      };
    });
  }, [reports]);

  function toggleVisit(appointmentId) {
    setExpandedVisits((current) => {
      const next = new Set(current);
      if (next.has(appointmentId)) next.delete(appointmentId);
      else next.add(appointmentId);
      return next;
    });
  }

  return (
    <div>
      <TopBar title="Clinical Reports" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!error && !reports && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-80" />
          ))}
        </div>
      )}
      {reports && visits.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No diagnosed patient reports are available.
          </CardContent>
        </Card>
      )}
      <div className="space-y-6">
        {visits.map((visit) => (
          <PatientVisitReport
            key={visit.appointmentId}
            visit={visit}
            expanded={expandedVisits.has(visit.appointmentId)}
            onToggle={() => toggleVisit(visit.appointmentId)}
          />
        ))}
      </div>
    </div>
  );
}

function PatientVisitReport({ visit, expanded, onToggle }) {
  const patient =
    visit.diagnosis.patientId ?? visit.diagnosis.appointmentId?.guestPatient;
  const appointment = visit.diagnosis.appointmentId;

  return (
    <Card className="border-slate-200">
      <CardHeader className="border-b bg-slate-50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>
              {patient
                ? `${patient.firstName} ${patient.lastName}`
                : "Guest patient"}
            </CardTitle>
            {expanded && (
              <CardDescription className="mt-1">
                {appointment?.appointmentDate
                  ? new Date(appointment.appointmentDate).toLocaleDateString()
                  : "Date unavailable"}
                {appointment?.timeSlot ? ` · ${appointment.timeSlot}` : ""}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {expanded && <Badge className="bg-blue-600">Diagnosed</Badge>}
            <Button variant="outline" size="sm" onClick={onToggle}>
              {expanded ? <ChevronUp /> : <ChevronDown />}
              {expanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="grid gap-4 p-5 xl:grid-cols-2">
          <ReportSection icon={FileText} title="Diagnosis report">
            <ReportValue label="Symptoms" value={visit.diagnosis.symptoms} />
            <ReportValue label="Diagnosis" value={visit.diagnosis.diagnosis} />
            <ReportValue
              label="Treatment plan"
              value={visit.diagnosis.treatmentPlan}
            />
            <ReportValue label="Notes" value={visit.diagnosis.notes} />
          </ReportSection>

          <ReportSection icon={Pill} title="Prescription">
            {visit.prescription ? (
              <>
                <ReportValue
                  label="Instructions"
                  value={visit.prescription.instructions}
                />
                <ReportValue label="Status" value={visit.prescription.status} />
                <ReportValue
                  label="Medicines"
                  value={visit.prescription.medicines
                    ?.map((medicine) => medicine.medicineName)
                    .join(", ")}
                />
              </>
            ) : (
              <EmptyRecord />
            )}
          </ReportSection>

          <ReportSection icon={FlaskConical} title="Lab test requests">
            {visit.labRequests.length ? (
              visit.labRequests.map((request) => (
                <div key={request._id} className="rounded-md border p-3">
                  <ReportValue label="Test" value={request.testName} />
                  <ReportValue
                    label="Instructions"
                    value={request.instructions}
                  />
                  <ReportValue label="Result" value={request.result} />
                  <ReportValue label="Status" value={request.status} />
                </div>
              ))
            ) : (
              <EmptyRecord />
            )}
          </ReportSection>

          <ReportSection icon={ScanLine} title="Radiology requests">
            {visit.radiologyRequests.length ? (
              visit.radiologyRequests.map((request) => (
                <div key={request._id} className="rounded-md border p-3">
                  <ReportValue label="Scan" value={request.scanType} />
                  <ReportValue
                    label="Instructions"
                    value={request.instructions}
                  />
                  <ReportValue label="Report" value={request.report} />
                  <ReportValue label="Status" value={request.status} />
                </div>
              ))
            ) : (
              <EmptyRecord />
            )}
          </ReportSection>
		  
		  <ReportSection icon={ScanLine} title="Endoscopy requests">
            {visit.endoscopyRequests.length ? (
              visit.endoscopyRequests.map((request) => (
                <div key={request._id} className="rounded-md border p-3">
                  <ReportValue label="Procedure" value={request.procedureType} />
                  <ReportValue
                    label="Instructions"
                    value={request.instructions}
                  />
                  <ReportValue label="Report" value={request.report} />
                  <ReportValue label="Status" value={request.status} />
                </div>
              ))
            ) : (
              <EmptyRecord />
            )}
          </ReportSection>
        </CardContent>
      )}
    </Card>
  );
}

function ReportSection({ icon: Icon, title, children }) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 p-4">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
        <Icon className="text-blue-600" /> {title}
      </h3>
      {children}
    </section>
  );
}

function ReportValue({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function EmptyRecord() {
  return <p className="text-sm text-slate-500">No record created.</p>;
}

function recordAppointmentId(record) {
  return (record.appointmentId?._id ?? record.appointmentId)?.toString();
}
