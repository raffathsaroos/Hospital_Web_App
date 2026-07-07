import { call, http } from "./api";

// Clinical commands share the authenticated API client and response wrapper.
export const createDiagnosis = (body) =>
  call(() => http.post("/diagnoses", body));
export const createPrescription = (body) =>
  call(() => http.post("/prescriptions", body));
export const createLabRequest = (body) =>
  call(() => http.post("/lab-requests", body));
export const createRadiologyRequest = (body) =>
  call(() => http.post("/radiology-requests", body));
export const getPrescriptions = (params = {}) =>
  call(() => http.get("/prescriptions", { params }));
export const getLabRequests = (params = {}) =>
  call(() => http.get("/lab-requests", { params }));
export const getRadiologyRequests = (params = {}) =>
  call(() => http.get("/radiology-requests", { params }));
export const dispensePrescription = (id, body) =>
  call(() => http.patch(`/prescriptions/${id}/dispense`, body));
export const completeLabRequest = (id, body) =>
  call(() => http.patch(`/lab-requests/${id}/complete`, body));
export const completeRadiologyRequest = (id, body) =>
  call(() => http.patch(`/radiology-requests/${id}/complete`, body));
export const getClinicalReports = () => call(() => http.get("/reports"));
