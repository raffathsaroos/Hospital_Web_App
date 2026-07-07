import { call, http } from "./api";

export const getDoctors = () => call(() => http.get("/doctors"));
export const getDoctorById = (id) => call(() => http.get(`/doctors/${id}`));
export const getDoctorsForAdmin = () =>
  call(() => http.get("/doctors/admin/all"));
export const getDoctorForAdmin = (id) =>
  call(() => http.get(`/doctors/admin/${id}`));
export const updateDoctor = (id, body) =>
  call(() => http.put(`/doctors/${id}`, body));
export const updateDoctorSchedule = (id, body) =>
  call(() => http.patch(`/doctors/${id}/schedule`, body));
export const setDoctorStatus = (id, isActive) =>
  call(() => http.patch(`/doctors/${id}/status`, { isActive }));
