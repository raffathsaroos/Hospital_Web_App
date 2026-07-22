import mongoose from "mongoose";
import clinicalDao from "../dao/clinical.dao.js";


const error = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });
const validId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw error(`Invalid ${label}.`, 400);
};

const appointmentForDoctor = async (appointmentId, actor) => {
  validId(appointmentId, "appointment ID");
  const appointment = await clinicalDao.findAppointment(appointmentId);
  if (!appointment) throw error("Appointment not found.", 404);
  if (appointment.doctorId.toString() !== actor._id.toString())
    throw error("This appointment is not assigned to you.", 403);
  if (!["Paid", "Diagnosed"].includes(appointment.status))
    throw error("Only paid appointments can receive clinical records.", 409);
  return appointment;
};

// Clinical records inherit trusted patient and doctor IDs from the appointment.
const baseRecord = (appointment, actor) => ({
  appointmentId: appointment._id,
  patientId: appointment.patientId,
  doctorId: actor._id,
});

const createDiagnosis = async (data, actor) => {
  if (!data.diagnosis?.trim()) throw error("Diagnosis is required.", 400);
  const appointment = await appointmentForDoctor(data.appointmentId, actor);
  const record = await clinicalDao.createDiagnosis({
    ...baseRecord(appointment, actor),
    symptoms: data.symptoms,
    diagnosis: data.diagnosis,
    treatmentPlan: data.treatmentPlan,
    notes: data.notes,
  });
  appointment.status = "Diagnosed";
  appointment.hasVisited = true;
  appointment.diagnosedAt = new Date();
  await clinicalDao.saveAppointment(appointment);
  return record;
};

const createPrescription = async (data, actor) => {
  const appointment = await appointmentForDoctor(data.appointmentId, actor);
  return clinicalDao.createPrescription({
    ...baseRecord(appointment, actor),
    instructions: data.instructions,
  });
};

const createLabRequest = async (data, actor) => {
  if (!data.testName?.trim()) throw error("Test name is required.", 400);
  const appointment = await appointmentForDoctor(data.appointmentId, actor);
  return clinicalDao.createLabRequest({
    ...baseRecord(appointment, actor),
    testName: data.testName,
    instructions: data.instructions,
  });
};

const createRadiologyRequest = async (data, actor) => {
  if (!data.scanType?.trim()) throw error("Scan type is required.", 400);
  const appointment = await appointmentForDoctor(data.appointmentId, actor);
  return clinicalDao.createRadiologyRequest({
    ...baseRecord(appointment, actor),
    scanType: data.scanType,
    instructions: data.instructions,
  });
};

const createEndoscopyRequest = async (data, actor) => {
  if (!data.procedureType?.trim()) throw error("Procedure type is required.", 400);
  const appointment = await appointmentForDoctor(data.appointmentId, actor);
  return clinicalDao.createEndoscopyRequest({
    ...baseRecord(appointment, actor),
    procedureType: data.procedureType,
    instructions: data.instructions,
  });
};

 // Patients and doctors are scoped to their records; operators receive work queues.
const actorFilter = (actor) => {
  if (actor.role === "Patient") return { patientId: actor._id };
  if (actor.role === "Doctor") return { doctorId: actor._id };
  return {};
};

const listPrescriptions = (actor, query) =>
  clinicalDao.findPrescriptions({
    ...actorFilter(actor),
    ...(query.status ? { status: query.status } : {}),
  });
const listLabRequests = (actor, query) =>
  clinicalDao.findLabRequests({
    ...actorFilter(actor),
    ...(query.status ? { status: query.status } : {}),
  });
const listRadiologyRequests = (actor, query) =>
  clinicalDao.findRadiologyRequests({
    ...actorFilter(actor),
    ...(query.status ? { status: query.status } : {}),
  });
  
  const listEndoscopyRequests = (actor, query) =>
  clinicalDao.findEndoscopyRequests({
    ...actorFilter(actor),
    ...(query.status ? { status: query.status } : {}),
  });

const dispensePrescription = async (id, data, actor) => {
  validId(id, "prescription ID");
  if (!Array.isArray(data.medicines) || data.medicines.length === 0)
    throw error("At least one medicine is required.", 400);
  const prescription = await clinicalDao.findPrescriptionById(id);
  if (!prescription) throw error("Prescription not found.", 404);
  if (prescription.status !== "Pending")
    throw error("Prescription is already dispensed.", 409);
  prescription.medicines = data.medicines.map((item) => {
    const values = [
      item.dosageQuantity,
      item.frequencyPerDay,
      item.numberOfDays,
      item.unitPrice,
    ].map(Number);
    if (values.some((value) => !Number.isInteger(value) || value <= 0))
      throw error(
        "Medicine quantities, frequency, days, and price must be positive whole numbers.",
        400,
      );
    return {
      medicineName: item.medicineName,
      dosageQuantity: values[0],
      frequencyPerDay: values[1],
      numberOfDays: values[2],
      unitPrice: values[3],
      total: values.reduce((total, value) => total * value, 1),
    };
  });
  if (prescription.medicines.some((item) => !item.medicineName?.trim()))
    throw error("Medicine name is required.", 400);
  prescription.grandTotal = prescription.medicines.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  prescription.status = "Dispensed";
  prescription.dispensedBy = actor._id;
  prescription.dispensedAt = new Date();
  await prescription.save();
  return prescription;
};

const completeLabRequest = async (id, data, actor) => {
  validId(id, "lab request ID");
  if (!data.result?.trim() || !(Number(data.price) > 0))
    throw error("Lab result and a positive price are required.", 400);
  const request = await clinicalDao.findLabRequestById(id);
  if (!request) throw error("Lab request not found.", 404);
  if (request.status === "Completed")
    throw error("Lab request is already completed.", 409);
  Object.assign(request, {
    result: data.result,
    price: Number(data.price),
    status: "Completed",
    completedBy: actor._id,
    completedAt: new Date(),
  });
  await request.save();
  return request;
};

const completeRadiologyRequest = async (id, data, actor) => {
  validId(id, "radiology request ID");
  if (!data.report?.trim() || !(Number(data.price) > 0))
    throw error("Radiology report and a positive price are required.", 400);
  const request = await clinicalDao.findRadiologyRequestById(id);
  if (!request) throw error("Radiology request not found.", 404);
  if (request.status === "Completed")
    throw error("Radiology request is already completed.", 409);
  Object.assign(request, {
    report: data.report,
    price: Number(data.price),
    status: "Completed",
    completedBy: actor._id,
    completedAt: new Date(),
  });
  await request.save();
  return request;
};

const completeEndoscopyRequest = async (id, data, actor) => {
  validId(id, "endoscopy request ID");
  if (!data.report?.trim() || !(Number(data.price) > 0))
    throw error("Endoscopy report and a positive price are required.", 400);
  const request = await clinicalDao.findEndoscopyRequestById(id);
  if (!request) throw error("Endoscopy request not found.", 404);
  if (request.status === "Completed")
    throw error("Endoscopy request is already completed.", 409);
  Object.assign(request, {
    report: data.report,
    price: Number(data.price),
    status: "Completed",
    completedBy: actor._id,
    completedAt: new Date(),
  });
  await request.save();
  return request;
};

const getReports = async (actor) => {
  const filter = actorFilter(actor);
  const [diagnoses, prescriptions, labReports, radiologyReports, endoscopyReports] =
    await Promise.all([
      clinicalDao.findDiagnoses(filter),
      clinicalDao.findPrescriptions(filter),
      clinicalDao.findLabRequests(filter),
      clinicalDao.findRadiologyRequests(filter),
      clinicalDao.findEndoscopyRequests(filter),
    ]);
  return { diagnoses, prescriptions, labReports, radiologyReports, endoscopyReports };
};

export default {
  createDiagnosis,
  createPrescription,
  createLabRequest,
  createRadiologyRequest,
  createEndoscopyRequest,
  listPrescriptions,
  listLabRequests,
  listRadiologyRequests,
  listEndoscopyRequests,
  dispensePrescription,
  completeLabRequest,
  completeRadiologyRequest,
  completeEndoscopyRequest,
  getReports,
};
