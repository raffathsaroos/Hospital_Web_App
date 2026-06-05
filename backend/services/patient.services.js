import patientDao from '../dao/patient.dao.js';
import userDao from '../dao/user.dao.js';

// Shared user fields that can be changed through the patient endpoint.
const editableUserFields = [
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

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureUniqueUser = async (userData, excludeId) => {
  const existingUser = await userDao.findUserByUniqueFields(userData, excludeId);

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

const registerPatient = async (patientData) => {
  await ensureUniqueUser(patientData);

  const user = await userDao.createUser({
    ...patientData,
    // Patient registration must never create a privileged account.
    role: 'Patient',
  });

  try {
    const patient = await patientDao.createPatient({ user: user._id });
    return patientDao.findPatientById(patient._id);
  } catch (error) {
    // Avoid leaving an unused user if patient profile creation fails.
    await userDao.deleteUserById(user._id);
    throw error;
  }
};

const getPatients = () => patientDao.findAllPatients();

const getPatient = async (id) => {
  const patient = await patientDao.findPatientById(id);

  if (!patient) {
    throw createError('Patient not found.', 404);
  }

  return patient;
};

const updatePatient = async (id, patientData) => {
  const patient = await getPatient(id);
  const updates = Object.fromEntries(
    Object.entries(patientData).filter(([key]) =>
      editableUserFields.includes(key)
    )
  );

  await ensureUniqueUser(updates, patient.user._id);
  await userDao.updateUserById(patient.user._id, updates);

  return patientDao.findPatientById(id);
};

const setPatientActiveStatus = async (id, isActive) => {
  const patient = await getPatient(id);

  await userDao.updateUserById(patient.user._id, { isActive });
  return patientDao.findPatientById(id);
};

const deletePatient = async (id) => {
  const patient = await getPatient(id);

  await patientDao.deletePatientById(id);
  await userDao.deleteUserById(patient.user._id);
};

export default {
  registerPatient,
  getPatients,
  getPatient,
  updatePatient,
  setPatientActiveStatus,
  deletePatient,
};
