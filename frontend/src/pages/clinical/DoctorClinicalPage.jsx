import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
  createDiagnosis,
  createLabRequest,
  createPrescription,
  createRadiologyRequest,
  createEndoscopyRequest,
} from "@/services/clinicalService";


const initialDiagnosis = {
  symptoms: "",
  diagnosis: "",
  treatmentPlan: "",
  notes: "",
};

// Sends each clinical artifact to the downstream team responsible for it.
export default function DoctorClinicalPage() {
  const { appointmentId } = useParams();
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis);
  const [prescription, setPrescription] = useState("");
  const [lab, setLab] = useState({ testName: "", instructions: "" });
  const [radiology, setRadiology] = useState({
    scanType: "",
    instructions: "",
  });
  const [endoscopy, setEndoscopy] = useState({
    procedureType: "",
    instructions: "",
  });

  async function submitDiagnosis(event) {
    event.preventDefault();
    const result = await createDiagnosis({ appointmentId, ...diagnosis });
    if (result.error) return toast.error(result.error);
    toast.success("Diagnosis report created");
    setDiagnosis(initialDiagnosis);
  }

  async function submitPrescription(event) {
    event.preventDefault();
    const result = await createPrescription({
      appointmentId,
      instructions: prescription,
    });
    if (result.error) return toast.error(result.error);
    toast.success("Prescription sent to pharmacist");
    setPrescription("");
  }

  async function submitLab(event) {
    event.preventDefault();
    const result = await createLabRequest({ appointmentId, ...lab });
    if (result.error) return toast.error(result.error);
    toast.success("Lab test request sent");
    setLab({ testName: "", instructions: "" });
  }

  async function submitRadiology(event) {
    event.preventDefault();
    const result = await createRadiologyRequest({
      appointmentId,
      ...radiology,
    });
    if (result.error) return toast.error(result.error);
    toast.success("Scan request sent to radiologist");
    setRadiology({ scanType: "", instructions: "" });
  }
  
  async function submitEndoscopy(event) {
    event.preventDefault();
    const result = await createEndoscopyRequest({
      appointmentId,
      ...endoscopy,
    });
    if (result.error) return toast.error(result.error);
    toast.success("Endoscopy request sent to Endoscopy operator");
    setEndoscopy({ procedureType: "", instructions: "" });
  }
  return (
    <div>
      <TopBar title="Clinical Workspace">
        <Button asChild variant="outline">
          <Link to="/appointments">
            <ArrowLeft /> Back to appointments
          </Link>
        </Button>
      </TopBar>
      <div className="grid gap-5 xl:grid-cols-2">
        <ClinicalCard
          title="Diagnosis report"
          description="Record the diagnosis and complete the doctor consultation."
        >
          <form onSubmit={submitDiagnosis} className="space-y-4">
            <Field label="Symptoms">
              <TextArea
                value={diagnosis.symptoms}
                onChange={(event) =>
                  setDiagnosis({ ...diagnosis, symptoms: event.target.value })
                }
              />
            </Field>
            <Field label="Diagnosis">
              <TextArea
                required
                value={diagnosis.diagnosis}
                onChange={(event) =>
                  setDiagnosis({ ...diagnosis, diagnosis: event.target.value })
                }
              />
            </Field>
            <Field label="Treatment plan">
              <TextArea
                value={diagnosis.treatmentPlan}
                onChange={(event) =>
                  setDiagnosis({
                    ...diagnosis,
                    treatmentPlan: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Notes">
              <TextArea
                value={diagnosis.notes}
                onChange={(event) =>
                  setDiagnosis({ ...diagnosis, notes: event.target.value })
                }
              />
            </Field>
            <Button className="w-full">Create diagnosis report</Button>
          </form>
        </ClinicalCard>
        <ClinicalCard
          title="Prescription"
          description="Send medication instructions to the pharmacy queue."
        >
          <form onSubmit={submitPrescription} className="space-y-4">
            <Field label="Prescription instructions">
              <TextArea
                required
                value={prescription}
                onChange={(event) => setPrescription(event.target.value)}
              />
            </Field>
            <Button className="w-full">Send to pharmacist</Button>
          </form>
        </ClinicalCard>
        <ClinicalCard
          title="Lab test request"
          description="Send a test request to the lab operator."
        >
          <form onSubmit={submitLab} className="space-y-4">
            <Field label="Test name">
              <Input
                required
                value={lab.testName}
                onChange={(event) =>
                  setLab({ ...lab, testName: event.target.value })
                }
              />
            </Field>
            <Field label="Instructions">
              <TextArea
                value={lab.instructions}
                onChange={(event) =>
                  setLab({ ...lab, instructions: event.target.value })
                }
              />
            </Field>
            <Button className="w-full">Send to lab</Button>
          </form>
        </ClinicalCard>
        <ClinicalCard
          title="Radiology request"
          description="Send a scan request to the radiologist."
        >
          <form onSubmit={submitRadiology} className="space-y-4">
            <Field label="Scan type">
              <Input
                required
                value={radiology.scanType}
                onChange={(event) =>
                  setRadiology({ ...radiology, scanType: event.target.value })
                }
              />
            </Field>
            <Field label="Instructions">
              <TextArea
                value={radiology.instructions}
                onChange={(event) =>
                  setRadiology({
                    ...radiology,
                    instructions: event.target.value,
                  })
                }
              />
            </Field>
            <Button className="w-full">Send to radiologist</Button>
          </form>
        </ClinicalCard>
		<ClinicalCard
          title="Endoscopy request"
          description="Send a procedure request to the endoscopy operator."
        >
          <form onSubmit={submitEndoscopy} className="space-y-4">
            <Field label="Procedure type">
              <Input
                required
                value={endoscopy.procedureType}
                onChange={(event) =>
                  setEndoscopy({ ...endoscopy, procedureType: event.target.value })
                }
              />
            </Field>
            <Field label="Instructions">
              <TextArea
                value={endoscopy.instructions}
                onChange={(event) =>
                  setEndoscopy({
                    ...endoscopy,
                    instructions: event.target.value,
                  })
                }
              />
            </Field>
            <Button className="w-full">Send to endoscopy operator</Button>
          </form>
        </ClinicalCard>
      </div>
    </div>
  );
}

function ClinicalCard({ title, description, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
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
function TextArea(props) {
  return (
    <textarea
      className="min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  );
}
