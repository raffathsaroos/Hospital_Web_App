import doctorDao from "../dao/doctor.dao.js";
import userDao from "../dao/user.dao.js";
import { WEEK_DAYS } from "../constants/weekdays.const.js";

const registrationUserFields = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "nic",
  "dob",
  "gender",
  "password",
  "avatar",
];

const doctorProfileFields = [
  "department",
  "specialization",
  "licenseNumber",
  "qualifications",
  "experience",
  "consultationFee",
  "availableDays",
  "availableTimeSlots",
  "isAvailable",
];

// Builds an error with a response status for the controller.
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Copies only fields accepted by the doctor workflow.
const pickFields = (data, allowedFields) =>
  Object.fromEntries(
    Object.entries(data).filter(([key]) => allowedFields.includes(key)),
  );

// Prevents a doctor from sharing another user's identity details.
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

// Prevents two doctors from sharing one license number.
const ensureUniqueLicense = async (licenseNumber, excludeId) => {
  if (!licenseNumber) return;

  const existingDoctor = await doctorDao.findDoctorByLicense(
    licenseNumber,
    excludeId,
  );

  if (existingDoctor) {
    throw createError("A doctor with this license number already exists.", 409);
  }
};

// Creates the user account and linked doctor profile together.
const addDoctor = async (doctorData) => {
  const userData = pickFields(doctorData, registrationUserFields);
  const profileData = pickFields(doctorData, doctorProfileFields);

  await ensureUniqueUser(userData);

  const user = await userDao.createUser({
    ...userData,
    role: "Doctor",
  });

  try {
    const doctor = await doctorDao.createDoctor({
      ...profileData,
      userId: user._id,
    });

    return doctorDao.findDoctorById(doctor._id);
  } catch (error) {
    // Do not leave an orphaned User if doctor profile validation fails.
    await userDao.deleteUserById(user._id);
    throw error;
  }
};

// Lists doctors whose user accounts are still active.
const getDoctors = () => doctorDao.findAllActiveDoctors();

const getAllDoctors = () => doctorDao.findAllDoctors();

// Returns one active doctor or reports that it is missing.
const getDoctor = async (id) => {
  const doctor = await doctorDao.findActiveDoctorById(id);

  if (!doctor || !doctor.userId) {
    throw createError("Doctor not found.", 404);
  }

  return doctor;
};

const getDoctorForAdmin = async (id) => {
  const doctor = await doctorDao.findDoctorById(id);
  if (!doctor || !doctor.userId) throw createError("Doctor not found.", 404);
  return doctor;
};

// Updates account and professional details for one doctor.
const updateDoctor = async (id, doctorData) => {
  const doctor = await doctorDao.findDoctorById(id);

  if (!doctor) {
    throw createError("Doctor not found.", 404);
  }

  if (!doctor.userId) {
    throw createError("Doctor user account not found.", 404);
  }

  const userData = pickFields(doctorData, registrationUserFields);
  const profileData = pickFields(doctorData, doctorProfileFields);

  await ensureUniqueUser(userData, doctor.userId._id);
  await ensureUniqueLicense(profileData.licenseNumber, doctor._id);

  if (Object.keys(profileData).length > 0) {
    await doctorDao.updateDoctorById(doctor._id, profileData);
  }

  if (Object.keys(userData).length > 0) {
    await userDao.updateUserById(doctor.userId._id, userData);
  }

  return doctorDao.findDoctorById(doctor._id);
};

// Updates only appointment availability fields for administrators and receptionists.
const updateDoctorSchedule = async (id, scheduleData) => {
  const doctor = await doctorDao.findDoctorById(id);

  if (!doctor || !doctor.userId) {
    throw createError("Doctor not found.", 404);
  }

  if (!Array.isArray(scheduleData.availableTimeSlots)) {
    throw createError("Available time slots must be an array.", 400);
  }

  if (typeof scheduleData.isAvailable !== "boolean") {
    throw createError("isAvailable must be true or false.", 400);
  }

  const availableTimeSlots = scheduleData.availableTimeSlots.map((slot) => ({
    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    slotDurationMinutes: Number(slot.slotDurationMinutes),
  }));

  for (const slot of availableTimeSlots) {
    if (!WEEK_DAYS.includes(slot.day)) {
      throw createError("Each time slot must use a valid weekday.", 400);
    }

    if (!slot.startTime || !slot.endTime || slot.endTime <= slot.startTime) {
      throw createError("Each time slot must end after it starts.", 400);
    }

    if (!Number.isInteger(slot.slotDurationMinutes)) {
      throw createError(
        "Slot duration must be a whole number of minutes.",
        400,
      );
    }
  }

  for (const day of WEEK_DAYS) {
    const slots = availableTimeSlots
      .filter((slot) => slot.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (let index = 1; index < slots.length; index += 1) {
      if (slots[index].startTime < slots[index - 1].endTime) {
        throw createError(`Time slots overlap on ${day}.`, 400);
      }
    }
  }

  const availableDays = WEEK_DAYS.filter((day) =>
    availableTimeSlots.some((slot) => slot.day === day),
  );

  if (scheduleData.isAvailable && availableTimeSlots.length === 0) {
    throw createError(
      "Add at least one time slot before making the doctor available.",
      400,
    );
  }

  await doctorDao.updateDoctorById(doctor._id, {
    availableDays,
    availableTimeSlots,
    isAvailable: scheduleData.isAvailable,
  });

  return doctorDao.findDoctorById(doctor._id);
};

// Enables or disables the account linked to one doctor.
const setDoctorActiveStatus = async (id, isActive) => {
  if (typeof isActive !== "boolean") {
    throw createError("isActive must be true or false.", 400);
  }

  const doctor = await doctorDao.findDoctorById(id);

  if (!doctor) {
    throw createError("Doctor not found.", 404);
  }

  if (!doctor.userId) {
    throw createError("Doctor user account not found.", 404);
  }

  await userDao.updateUserById(doctor.userId._id, { isActive });
  return doctorDao.findDoctorById(doctor._id);
};

// Hides a doctor by disabling the linked user account.
const deactivateDoctor = async (id) => {
  const doctor = await doctorDao.findDoctorById(id);

  if (!doctor) {
    throw createError("Doctor not found.", 404);
  }

  if (!doctor.userId) {
    throw createError("Doctor user account not found.", 404);
  }

  await userDao.updateUserById(doctor.userId._id, { isActive: false });
};

export default {
  addDoctor,
  getDoctors,
  getAllDoctors,
  getDoctor,
  getDoctorForAdmin,
  updateDoctor,
  updateDoctorSchedule,
  setDoctorActiveStatus,
  deactivateDoctor,
};
