import Patient from '../models/patient.model.js';

const createPatient = (patientData) => Patient.create(patientData);

const findAllPatients = () =>
  Patient.find().populate('user').sort({ createdAt: -1 });

const findPatientById = (id) => Patient.findById(id).populate('user');

const deletePatientById = (id) => Patient.findByIdAndDelete(id);

export default {
  createPatient,
  findAllPatients,
  findPatientById,
  deletePatientById,
};
