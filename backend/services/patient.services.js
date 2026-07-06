import patientDao from "../dao/patient.dao.js";
import userDao from "../dao/user.dao.js";
import appointmentDao from "../dao/appointment.dao.js";
import clinicalDao from "../dao/clinical.dao.js";
import mongoose from "mongoose";

// Only these common account fields may enter the User document from patient APIs.
const registrationUserFields = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "nic",
  "dob",
  "gender",
  "password",
];

const editableUserFields = [...registrationUserFields, "avatar"];

// Builds an error with the status expected by the API.
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Copies only fields that the patient API accepts.
const pickFields = (data, allowedFields) =>
  Object.fromEntries(
    Object.entries(data).filter(([key]) => allowedFields.includes(key)),
  );

// Makes sure identity fields do not belong to another user.
const ensureUniqueUser = async (userData, excludeId) => {
  const existingUser = await userDao.findUserByUniqueFields(
    userData,
    excludeId,
  );

  if (!existingUser) return;

  if (
    userData.email &&
    existingUser.email === userData.email.toLowerCase().trim()
  ) {
    throw createError("A user with this email already exists.", 409);
  }

  if (userData.phone && existingUser.phone === userData.phone.trim()) {
    throw createError("A user with this phone number already exists.", 409);
  }

  throw createError("A user with this NIC already exists.", 409);
};

// Creates a patient account and profile as one workflow.
const registerPatient = async (patientData) => {
  const userData = pickFields(patientData, registrationUserFields);
  let diagnosedGuestAppointment = null;
  let originalGuestPatient = null;

  if (patientData.appointmentId) {
    if (!mongoose.Types.ObjectId.isValid(patientData.appointmentId)) {
      throw createError("Invalid appointment ID.", 400);
    }
    diagnosedGuestAppointment =
      await appointmentDao.findAppointmentDocumentById(
        patientData.appointmentId,
      );
    if (!diagnosedGuestAppointment) {
      throw createError("Appointment not found.", 404);
    }
    if (
      diagnosedGuestAppointment.status !== "Diagnosed" ||
      !diagnosedGuestAppointment.guestPatient ||
      diagnosedGuestAppointment.patientId
    ) {
      throw createError(
        "Only a diagnosed guest appointment can be converted to a patient.",
        409,
      );
    }
    originalGuestPatient = diagnosedGuestAppointment.guestPatient.toObject();
  }

  await ensureUniqueUser(userData);

  const user = await userDao.createUser({
    ...userData,
    // Patient registration must never create a privileged account.
    role: "Patient",
  });

  try {
    const patient = await patientDao.createPatient({ user: user._id });

    if (diagnosedGuestAppointment) {
      diagnosedGuestAppointment.patientId = user._id;
      diagnosedGuestAppointment.guestPatient = null;
      await diagnosedGuestAppointment.save();
      await clinicalDao.linkAppointmentRecordsToPatient(
        diagnosedGuestAppointment._id,
        user._id,
      );
    }

    return patientDao.findPatientById(patient._id);
  } catch (error) {
    // Avoid leaving an unused user if patient profile creation fails.
    if (
      diagnosedGuestAppointment?.patientId?.toString() === user._id.toString()
    ) {
      diagnosedGuestAppointment.patientId = null;
      diagnosedGuestAppointment.guestPatient = originalGuestPatient;
      await diagnosedGuestAppointment.save();
      await clinicalDao.linkAppointmentRecordsToPatient(
        diagnosedGuestAppointment._id,
        null,
      );
    }
    const patient = await patientDao.findPatientByUserId(user._id);
    if (patient) await patientDao.deletePatientById(patient._id);
    await userDao.deleteUserById(user._id);
    throw error;
  }
};

// Returns every patient with the linked account details.
const getPatients = () => patientDao.findAllPatients();

// Finds one patient or raises a clear missing-record error.
const getPatient = async (id) => {
  const patient = await patientDao.findPatientById(id);

  if (!patient) {
    throw createError("Patient not found.", 404);
  }

  return patient;
};

// Updates the shared account fields for one patient.
const updatePatient = async (id, patientData) => {
  const patient = await getPatient(id);
  const updates = pickFields(patientData, editableUserFields);

  await ensureUniqueUser(updates, patient.user._id);
  await userDao.updateUserById(patient.user._id, updates);

  return patientDao.findPatientById(id);
};

// Enables or disables the patient's user account.
const setPatientActiveStatus = async (id, isActive) => {
  const patient = await getPatient(id);

  await userDao.updateUserById(patient.user._id, { isActive });
  return patientDao.findPatientById(id);
};

export default {
  registerPatient,
  getPatients,
  getPatient,
  updatePatient,
  setPatientActiveStatus,
};
