import Appointment from "../models/appointment.model.js";
import Diagnosis from "../models/diagnosis.model.js";
import Prescription from "../models/prescription.model.js";
import LabRequest from "../models/labRequest.model.js";
import RadiologyRequest from "../models/radiologyRequest.model.js";

const people = "firstName lastName email phone";
// Populate the identity and appointment context required by clinical work queues.
const populate = (query) =>
  query
    .populate("patientId", people)
    .populate("doctorId", people)
    .populate("appointmentId", "guestPatient appointmentDate timeSlot status");
const findAppointment = (id) => Appointment.findById(id);
const saveAppointment = (appointment) => appointment.save();
const createDiagnosis = (data) => Diagnosis.create(data);
const createPrescription = (data) => Prescription.create(data);
const createLabRequest = (data) => LabRequest.create(data);
const createRadiologyRequest = (data) => RadiologyRequest.create(data);
const findDiagnoses = (filter) =>
  populate(Diagnosis.find(filter).sort({ createdAt: -1 }));
const findPrescriptions = (filter) =>
  populate(Prescription.find(filter).sort({ createdAt: -1 }));
const findLabRequests = (filter) =>
  populate(LabRequest.find(filter).sort({ createdAt: -1 }));
const findRadiologyRequests = (filter) =>
  populate(RadiologyRequest.find(filter).sort({ createdAt: -1 }));
const findPrescriptionById = (id) => Prescription.findById(id);
const findLabRequestById = (id) => LabRequest.findById(id);
const findRadiologyRequestById = (id) => RadiologyRequest.findById(id);

// Connects clinical records created for a guest visit to the new patient account.
const linkAppointmentRecordsToPatient = (appointmentId, patientId) =>
  Promise.all([
    Diagnosis.updateMany({ appointmentId }, { patientId }),
    Prescription.updateMany({ appointmentId }, { patientId }),
    LabRequest.updateMany({ appointmentId }, { patientId }),
    RadiologyRequest.updateMany({ appointmentId }, { patientId }),
  ]);

export default {
  findAppointment,
  saveAppointment,
  createDiagnosis,
  createPrescription,
  createLabRequest,
  createRadiologyRequest,
  findDiagnoses,
  findPrescriptions,
  findLabRequests,
  findRadiologyRequests,
  findPrescriptionById,
  findLabRequestById,
  findRadiologyRequestById,
  linkAppointmentRecordsToPatient,
};
