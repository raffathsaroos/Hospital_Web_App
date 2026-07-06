import Doctor from '../models/doctor.model.js';

// Public doctor endpoints expose only directory-safe account fields.
const userFields = 'firstName lastName role isActive avatar';
const adminUserFields =
  'firstName lastName email phone nic dob gender role isActive avatar';

// Inserts one doctor profile.
const createDoctor = (doctorData) => Doctor.create(doctorData);

// Lists profiles whose linked accounts are still active.
const findAllActiveDoctors = async () => {
  const doctors = await Doctor.find()
    .populate({
      path: 'userId',
      match: { isActive: true },
      select: userFields,
    })
    .sort({ createdAt: -1 });

  return doctors.filter((doctor) => doctor.userId);
};

// Admin management includes inactive accounts so they can be reactivated.
const findAllDoctors = () =>
  Doctor.find().populate('userId', adminUserFields).sort({ createdAt: -1 });

// Finds one visible doctor and safe account details.
const findActiveDoctorById = (id) =>
  Doctor.findById(id).populate({
    path: 'userId',
    match: { isActive: true },
    select: userFields,
  });

// Finds a doctor even when its account is inactive.
const findDoctorById = (id) =>
  Doctor.findById(id).populate('userId', adminUserFields);

// Finds another doctor that uses the same license number.
const findDoctorByLicense = (licenseNumber, excludeId) => {
  const filter = {
    licenseNumber: licenseNumber.trim().toUpperCase(),
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return Doctor.findOne(filter);
};

// Saves validated profile changes and returns the fresh doctor.
const updateDoctorById = (id, doctorData) =>
  Doctor.findByIdAndUpdate(id, doctorData, {
    new: true,
    runValidators: true,
  });

export default {
  createDoctor,
  findAllActiveDoctors,
  findAllDoctors,
  findActiveDoctorById,
  findDoctorById,
  findDoctorByLicense,
  updateDoctorById,
};
