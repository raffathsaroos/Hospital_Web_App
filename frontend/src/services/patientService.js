import { call, http } from "./api";

// Loads all patients for the management table.
export const getPatients = () => call(() => http.get("/patients"));
// Sends a new patient account to the API.
export const registerPatient = (body) =>
  call(() => http.post("/patients", body));
// Loads one patient for detail and edit screens.
export const getPatientById = (id) => call(() => http.get(`/patients/${id}`));
// Saves changes made to one patient.
export const updatePatient = (id, body) =>
  call(() => http.put(`/patients/${id}`, body));
// Switches a patient account between active and inactive.
export const setPatientStatus = (id, active) =>
  call(() => http.patch(`/patients/${id}/status`, { isActive: active }));
// Permanently removes one patient record.
export const deletePatient = (id) => call(() => http.delete(`/patients/${id}`));
