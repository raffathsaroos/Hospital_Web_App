import { call, http } from "./api";

export const createPublicAppointment = (body) =>
  call(() => http.post("/appointments/public", body));

export const getAppointments = (params = {}) =>
  call(() => http.get("/appointments", { params }));

export const updateAppointmentStatus = (id, body) =>
  call(() => http.patch(`/appointments/${id}/status`, body));
