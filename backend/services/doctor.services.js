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

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const pickFields = (data, allowedFields) =>
  Object.fromEntries(
    Object.entries(data).filter(([key]) => allowedFields.includes(key))
  );

const ensureUniqueUser = async (userData) => {
  const existingUser = await userDao.findUserByUniqueFields(userData);

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

const getDoctors = () => doctorDao.findAllActiveDoctors();

const getDoctor = async (id) => {
  const doctor = await doctorDao.findActiveDoctorById(id);

  if (!doctor || !doctor.userId) {
    throw createError('Doctor not found.', 404);
  }

  return doctor;
};

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
  deactivateDoctor,
};
