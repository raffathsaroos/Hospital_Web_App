import doctorDao from '../dao/doctor.dao.js';
import userDao from '../dao/user.dao.js';

const registrationUserFields = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'nic',
  'dob',
  'gender',
  'password',
  'avatar',
];

const doctorProfileFields = [
  'department',
  'specialization',
  'licenseNumber',
  'qualifications',
  'experience',
  'consultationFee',
  'availableDays',
  'availableTimeSlots',
  'isAvailable',
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
    Object.entries(data).filter(([key]) => allowedFields.includes(key))
  );

// Prevents a doctor from sharing another user's identity details.
const ensureUniqueUser = async (userData, excludeId) => {
  const existingUser = await userDao.findUserByUniqueFields(
    userData,
    excludeId
  );

  if (!existingUser) return;

  if (
    userData.email &&
    existingUser.email === userData.email.toLowerCase().trim()
  ) {
    throw createError('A user with this email already exists.', 409);
  }

  if (userData.phone && existingUser.phone === userData.phone.trim()) {
    throw createError('A user with this phone number already exists.', 409);
  }

  throw createError('A user with this NIC already exists.', 409);
};

// Prevents two doctors from sharing one license number.
const ensureUniqueLicense = async (licenseNumber, excludeId) => {
  if (!licenseNumber) return;

  const existingDoctor = await doctorDao.findDoctorByLicense(
    licenseNumber,
    excludeId
  );

  if (existingDoctor) {
    throw createError(
      'A doctor with this license number already exists.',
      409
    );
  }
};

// Creates the user account and linked doctor profile together.
const addDoctor = async (doctorData) => {
  const userData = pickFields(doctorData, registrationUserFields);
  const profileData = pickFields(doctorData, doctorProfileFields);

  await ensureUniqueUser(userData);

  const user = await userDao.createUser({
    ...userData,
    role: 'Doctor',
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

// Returns one active doctor or reports that it is missing.
const getDoctor = async (id) => {
  const doctor = await doctorDao.findActiveDoctorById(id);

  if (!doctor || !doctor.userId) {
    throw createError('Doctor not found.', 404);
  }

  return doctor;
};

// Updates account and professional details for one doctor.
const updateDoctor = async (id, doctorData) => {
  const doctor = await doctorDao.findDoctorById(id);

  if (!doctor) {
    throw createError('Doctor not found.', 404);
  }

  if (!doctor.userId) {
    throw createError('Doctor user account not found.', 404);
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

// Enables or disables the account linked to one doctor.
const setDoctorActiveStatus = async (id, isActive) => {
  if (typeof isActive !== 'boolean') {
    throw createError('isActive must be true or false.', 400);
  }

  const doctor = await doctorDao.findDoctorById(id);

  if (!doctor) {
    throw createError('Doctor not found.', 404);
  }

  if (!doctor.userId) {
    throw createError('Doctor user account not found.', 404);
  }

  await userDao.updateUserById(doctor.userId._id, { isActive });
  return doctorDao.findDoctorById(doctor._id);
};

// Hides a doctor by disabling the linked user account.
const deactivateDoctor = async (id) => {
  const doctor = await doctorDao.findDoctorById(id);

  if (!doctor) {
    throw createError('Doctor not found.', 404);
  }

  if (!doctor.userId) {
    throw createError('Doctor user account not found.', 404);
  }

  await userDao.updateUserById(doctor.userId._id, { isActive: false });
};

export default {
  addDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  setDoctorActiveStatus,
  deactivateDoctor,
};
