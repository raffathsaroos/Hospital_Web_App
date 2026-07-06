import Patient from '../models/patient.model.js';

// Inserts one patient profile.
const createPatient = (patientData) => Patient.create(patientData);

// Lists patients with their shared account details.
const findAllPatients = () =>
  Patient.find().populate('user').sort({ createdAt: -1 });

// Finds one patient and loads the linked account.
const findPatientById = (id) => Patient.findById(id).populate('user');

export default {
  createPatient,
  findAllPatients,
  findPatientById,
};
