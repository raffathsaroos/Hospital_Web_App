import Patient from '../models/patient.model.js';

const createPatient = (patientData) => Patient.create(patientData);

const findPatients = (filter = {}) => Patient.find(filter).sort({ createdAt: -1 });

const findPatientById = (patientId) => Patient.findById(patientId);

const findPatientByEmail = (email) => Patient.findOne({ email });

const findPatientByNationalId = (nationalId) => Patient.findOne({ nationalId });

const updatePatientById = (patientId, patientData) => (
	Patient.findByIdAndUpdate(patientId, patientData, { new: true, runValidators: true })
);

const deletePatientById = (patientId) => Patient.findByIdAndDelete(patientId);

export default {
	createPatient,
	findPatients,
	findPatientById,
	findPatientByEmail,
	findPatientByNationalId,
	updatePatientById,
	deletePatientById
};
