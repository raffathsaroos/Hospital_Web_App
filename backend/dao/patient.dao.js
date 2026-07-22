import Patient from "../models/patient.model.js";

// Inserts one patient profile.
const createPatient = (patientData) => Patient.create(patientData);

// Lists patients with their shared account details.
const findAllPatients = () =>
  Patient.find().populate("user").sort({ createdAt: -1 });

// Finds one patient and loads the linked account.
const findPatientById = (id) => Patient.findById(id).populate("user");

// Update patient dat after edits
const updatePatientById = (id, data) =>
  Patient.findByIdAndUpdate(id, data, { new: true });

export default {
  createPatient,
  findAllPatients,
  findPatientById,
  updatePatientById,
};
